/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

// ── Helper: Get or create DB user from Clerk session ────────
async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;
  const name = clerkUser.fullName || clerkUser.username || email.split('@')[0];

  let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { email }, data: { clerkUserId: clerkUser.id, name } });
    } else {
      user = await prisma.user.create({ data: { clerkUserId: clerkUser.id, email, name } });
    }
  }

  // Link any guest bulk inquiries submitted with this email to the user profile
  await prisma.bulkInquiry.updateMany({
    where: {
      email: email,
      userId: null
    },
    data: {
      userId: user.id
    }
  });

  return user;
}

// ── Helper: Create SMTP transporter using .env variables ────────
function createEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    console.warn('SMTP credentials are missing. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * GET /api/bulk-inquiries
 *
 * Retrieves inquiries:
 * - If admin: returns ALL inquiries.
 * - If authenticated user: returns only user's inquiries.
 * - Otherwise: 401 Unauthorized.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view inquiries' }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
    const isAdmin = [adminEmail.toLowerCase(), 'yousufsuhaily@gmail.com'].includes(user.email.toLowerCase());

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status') || undefined;

    let inquiries;

    if (isAdmin) {
      // Admin sees everything
      inquiries = await prisma.bulkInquiry.findMany({
        where: statusFilter ? { status: statusFilter } : {},
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Regular user sees only their own (either by userId or matching email)
      inquiries = await prisma.bulkInquiry.findMany({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ],
          status: statusFilter,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(inquiries);
  } catch (err: any) {
    console.error('Fetch inquiries error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch inquiries' }, { status: 500 });
  }
}

/**
 * POST /api/bulk-inquiries
 *
 * Submits a new wholesale / bulk inquiry. Supports guests and authenticated users.
 *
 * Body: {
 *   customerName: string,
 *   companyName?: string,
 *   mobile: string,
 *   email: string,
 *   gstNumber?: string,
 *   deliveryLocation: string,
 *   specialRequirements?: string,
 *   preferredContact: 'EMAIL' | 'WHATSAPP' | 'PHONE',
 *   items: [{ productId: string, quantity: number }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getDbUser();
    const body = await req.json();

    const {
      customerName,
      companyName,
      mobile,
      email,
      gstNumber,
      deliveryLocation,
      specialRequirements,
      preferredContact,
      items,
    } = body;

    // Validation
    if (!customerName || !mobile || !email || !deliveryLocation || !preferredContact) {
      return NextResponse.json({ error: 'Please fill out all required fields' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please request at least one product' }, { status: 400 });
    }

    // Dynamic MOQ verification and details gathering
    const inquiryItemsData = [];
    const productsDetails = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product "${item.productId}" not found` }, { status: 400 });
      }

      // Determine MOQ dynamically based on category
      const moq = product.category === 'kitchenware' ? 50 : 30;
      if (item.quantity < moq) {
        return NextResponse.json(
          { error: `Minimum order quantity for "${product.name}" is ${moq} units.` },
          { status: 400 }
        );
      }

      inquiryItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
      });

      productsDetails.push({
        name: product.name,
        quantity: item.quantity,
        priceRupees: product.price / 100,
        category: product.category,
      });
    }

    // Generate a pure 6‑digit numeric Inquiry ID (e.g., 842391)
    const inquiryId = Math.floor(100000 + Math.random() * 900000).toString();

    // DB Persistence
    const inquiry = await prisma.bulkInquiry.create({
      data: {
        id: inquiryId,
        userId: user ? user.id : null, // guest-friendly
        customerName,
        companyName: companyName || null,
        mobile,
        email,
        gstNumber: gstNumber || null,
        deliveryLocation,
        specialRequirements: specialRequirements || null,
        preferredContact,
        status: 'PENDING',
        items: {
          create: inquiryItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // ── Email Notifications ─────────────────────────────────
    const transporter = createEmailTransporter();
    if (transporter) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
      const fromEmail = process.env.SMTP_FROM || 'abdershaheen4@gmail.com';

      const itemsHtml = productsDetails
        .map(
          (p) =>
            `<tr>
               <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
               <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.quantity}</td>
               <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${p.priceRupees.toFixed(2)}</td>
             </tr>`
        )
        .join('');

      // 1. Admin Alert Email
      const adminMailOptions = {
        from: fromEmail,
        to: [adminEmail, 'yousufsuhaily@gmail.com'].join(','),
        subject: `🚨 [B2B Wholesale Lead] New Bulk Inquiry from ${customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <div style="background-color: #071120; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
              <h2 style="margin: 0; color: #fbbf24;">New Wholesale Inquiry</h2>
            </div>
            <div style="padding: 20px 0;">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
              <p><strong>GST Number:</strong> ${gstNumber || 'N/A'}</p>
              <p><strong>Mobile:</strong> ${mobile}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
              <p><strong>Delivery Location:</strong> ${deliveryLocation}</p>
              <p><strong>Special Requirements:</strong> ${specialRequirements || 'None'}</p>
              
              <h3 style="margin-top: 25px;">Requested Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 8px; text-align: left; font-size: 14px;">Product Name</th>
                    <th style="padding: 8px; text-align: center; font-size: 14px;">Quantity</th>
                    <th style="padding: 8px; text-align: right; font-size: 14px;">Retail Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 30px; text-align: center;">
                <a href="${req.nextUrl.origin}/admin/bulk-inquiries" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                  View & Manage Inquiry
                </a>
              </div>
            </div>
          </div>
        `,
      };

      // 2. Customer Confirmation Email
      const customerMailOptions = {
        from: fromEmail,
        to: email,
        subject: `✅ Inquiry Confirmed: Bulk Order Request at Kitchenbay`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <div style="background-color: #071120; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
              <h2 style="margin: 0; color: #fbbf24;">Inquiry Received!</h2>
            </div>
            <div style="padding: 20px 0;">
              <p>Dear ${customerName},</p>
              <p>Thank you for reaching out to Kitchenbay. We have received your wholesale / bulk order inquiry. Our dedicated B2B manager is reviewing your requirements and will contact you via <strong>${preferredContact}</strong> shortly.</p>
              
              <h3>Inquiry Overview</h3>
              <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
              <p><strong>Delivery Location:</strong> ${deliveryLocation}</p>
              <p><strong>Status:</strong> Pending (Reviewing)</p>
              
              <h3 style="margin-top: 25px;">Requested Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 8px; text-align: left; font-size: 14px;">Product Name</th>
                    <th style="padding: 8px; text-align: center; font-size: 14px;">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsDetails
                    .map(
                      (p) =>
                        `<tr>
                           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
                           <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.quantity}</td>
                         </tr>`
                    )
                    .join('')}
                </tbody>
              </table>

              <p style="margin-top: 25px; font-size: 13px; color: #666;">
                ${
                  user
                    ? `You can track the status of your inquiries anytime under <a href="${req.nextUrl.origin}/orders/bulk" style="color: #2563eb; font-weight: bold; text-decoration: none;">My Bulk Inquiries</a> in your customer profile.`
                    : `You can track this inquiry by signing up or logging into Kitchenbay with the email <strong>${email}</strong>.`
                }
              </p>
              
              <div style="margin-top: 30px; text-align: center; font-size: 14px; font-weight: bold;">
                <p style="margin: 0; color: #1e3a8a;">Kitchenbay B2B division</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Premium Traditional Indian Cookware & Decor</p>
              </div>
            </div>
          </div>
        `,
      };

      // Send emails asynchronously without awaiting them, so that SMTP network delays do not block the API response
      transporter.sendMail(adminMailOptions)
        .then(() => console.log('Bulk Inquiry admin notification email sent.'))
        .catch(mailErr => console.error('Nodemailer failed to send admin email:', mailErr));

      transporter.sendMail(customerMailOptions)
        .then(() => console.log('Bulk Inquiry customer confirmation email sent.'))
        .catch(mailErr => console.error('Nodemailer failed to send customer email:', mailErr));
    }

    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
  } catch (err: any) {
    console.error('Create inquiry error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit inquiry' }, { status: 500 });
  }
}
