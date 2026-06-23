/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminEmails } from '@/lib/adminAuth';
import { getDbUser } from '@/lib/serverAuth';
import nodemailer from 'nodemailer';

/**
 * POST /api/bulk-inquiries/[id]/send-quotation
 *
 * Admin-only endpoint that sends a formal B2B quotation email to the customer
 * and updates the inquiry status to QUOTATION_SENT.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getDbUser();

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    // Admin-only
    const adminEmailsList = getAdminEmails();
    const isAdmin = adminEmailsList.includes(user.email.toLowerCase());
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Load full inquiry with items + product
    const inquiry = await prisma.bulkInquiry.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Grab optional override from request body
    const body = await req.json().catch(() => ({}));
    const { negotiatedPrice, adminNotes } = body;

    // Determine the price to use for the quotation
    const negotiatedPricePaise =
      negotiatedPrice != null && !isNaN(Number(negotiatedPrice)) && Number(negotiatedPrice) > 0
        ? Math.round(Number(negotiatedPrice) * 100)
        : inquiry.negotiatedPrice;

    const item = inquiry.items[0];
    const product = item?.product;
    const qty = item?.quantity || 0;
    const retailPricePaise = product?.price || 0;
    const usedPricePaise = negotiatedPricePaise ?? retailPricePaise;
    const usedPriceRupees = usedPricePaise / 100;
    const gstPercent = product?.gstPercent || 18;

    const subtotal = usedPriceRupees * qty;
    const gstAmount = subtotal * (gstPercent / 100);
    const grandTotal = subtotal + gstAmount;

    // ── Update DB with negotiated price & status ─────────────────
    const updatedInquiry = await prisma.bulkInquiry.update({
      where: { id },
      data: {
        status: 'QUOTATION_SENT',
        negotiatedPrice: negotiatedPricePaise ?? inquiry.negotiatedPrice,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    // ── Build and send the quotation email ───────────────────────
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.SMTP_FROM || smtpUser || adminEmailsList[0];

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD in .env' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const isDiscounted = negotiatedPricePaise != null && negotiatedPricePaise < retailPricePaise;
    const savingsPerUnit = isDiscounted ? (retailPricePaise - usedPricePaise) / 100 : 0;
    const totalSavings = savingsPerUnit * qty;

    const quotationEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B Quotation - Kitchenbay</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color:#f4f6f9; color:#333;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #071120 0%, #0c2340 100%); padding:32px 28px; text-align:center;">
      <p style="margin:0 0 6px 0; color:#fbbf24; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase;">Kitchenbay B2B</p>
      <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800;">Wholesale Quotation</h1>
      <p style="margin:10px 0 0 0; color:#93c5fd; font-size:13px;">Formal Price Quotation for Your Bulk Order</p>
    </div>

    <!-- Inquiry Badge -->
    <div style="background:#f0f9ff; border-bottom:1px solid #e0f2fe; padding:14px 28px; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:12px; color:#64748b;">Inquiry Reference</span>
      <span style="font-size:13px; font-weight:800; color:#1e3a5f; font-family:monospace; background:#dbeafe; padding:4px 12px; border-radius:20px;">#${inquiry.id}</span>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 28px 16px 28px;">
      <p style="margin:0 0 12px 0; font-size:16px; color:#1e293b; font-weight:600;">Dear ${inquiry.customerName},</p>
      <p style="margin:0; font-size:14px; color:#475569; line-height:1.7;">
        Thank you for choosing Kitchenbay for your wholesale requirements. We have reviewed your bulk order inquiry and are pleased to share our special B2B pricing quotation for your consideration.
      </p>
    </div>

    <!-- Product Details -->
    <div style="margin:0 28px 20px 28px; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
      <div style="background:#f8fafc; padding:12px 16px; border-bottom:1px solid #e2e8f0;">
        <p style="margin:0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Ordered Product</p>
      </div>
      <div style="padding:16px; display:flex; gap:16px; align-items:center;">
        ${product?.image ? `<img src="${product.image}" alt="${product?.name}" style="width:72px; height:72px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0;" />` : ''}
        <div>
          <p style="margin:0 0 4px 0; font-size:15px; font-weight:700; color:#1e293b;">${product?.name || 'Product'}</p>
          <p style="margin:0 0 4px 0; font-size:12px; color:#64748b; text-transform:capitalize;">Category: ${product?.category || ''}</p>
          <p style="margin:0; font-size:12px; color:#94a3b8;">Retail MRP: ₹${(retailPricePaise / 100).toLocaleString('en-IN')} per unit</p>
        </div>
      </div>
    </div>

    <!-- B2B Quotation Table -->
    <div style="margin:0 28px 20px 28px; background:linear-gradient(135deg, #071120 0%, #0c2340 100%); border-radius:14px; overflow:hidden; color:#fff;">
      <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.1);">
        <p style="margin:0; font-size:11px; font-weight:700; color:#fbbf24; text-transform:uppercase; letter-spacing:1.5px;">📄 B2B Price Quotation Sheet</p>
      </div>
      <div style="padding:16px 20px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <tr>
            <td style="padding:6px 0; color:#93c5fd;">Wholesale Unit Rate</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#fff;">₹${usedPriceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#93c5fd;">Quantity</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#fff;">× ${qty} units</td>
          </tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.1);">
            <td style="padding:10px 0 4px 0; color:#93c5fd;">Subtotal (Excl. GST)</td>
            <td style="padding:10px 0 4px 0; text-align:right; font-weight:700; color:#fff;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#34d399;">GST (${gstPercent}%)</td>
            <td style="padding:4px 0; text-align:right; color:#34d399; font-weight:600;">+ ₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ${isDiscounted ? `
          <tr>
            <td style="padding:4px 0; color:#fbbf24;">Your Savings</td>
            <td style="padding:4px 0; text-align:right; color:#fbbf24; font-weight:700;">- ₹${totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>` : ''}
          <tr style="border-top:2px solid rgba(255,255,255,0.2);">
            <td style="padding:12px 0 0 0; font-size:15px; font-weight:800; color:#fbbf24;">Estimated Grand Total</td>
            <td style="padding:12px 0 0 0; text-align:right; font-size:18px; font-weight:800; color:#fbbf24;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
      <div style="padding:10px 20px 16px 20px;">
        <p style="margin:0; font-size:10px; color:rgba(255,255,255,0.4);">* GST Invoice will be provided after order confirmation. Prices are subject to change without notice.</p>
      </div>
    </div>

    <!-- Delivery Details -->
    <div style="margin:0 28px 20px 28px; padding:14px 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;">
      <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#166534; text-transform:uppercase; letter-spacing:1px;">Delivery Location</p>
      <p style="margin:0; font-size:13px; color:#15803d; font-weight:600;">📍 ${inquiry.deliveryLocation}</p>
    </div>

    ${inquiry.gstNumber ? `
    <!-- GST Details -->
    <div style="margin:0 28px 20px 28px; padding:12px 16px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px;">
      <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#9a3412; text-transform:uppercase; letter-spacing:1px;">Your GSTIN</p>
      <p style="margin:0; font-size:13px; color:#c2410c; font-weight:700; font-family:monospace;">${inquiry.gstNumber}</p>
    </div>` : ''}

    <!-- Next Steps -->
    <div style="margin:0 28px 28px 28px; padding:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
      <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:#1e293b;">✅ Next Steps to Confirm Your Order</p>
      <ol style="margin:0; padding-left:18px; font-size:13px; color:#475569; line-height:2;">
        <li>Review this quotation carefully</li>
        <li>Reply to this email to confirm your acceptance</li>
        <li>We will generate a <strong>GST Proforma Invoice</strong> for you</li>
        <li>Payment details and dispatch timeline will be shared</li>
      </ol>
    </div>

    <!-- Track Inquiry -->
    <div style="margin:0 28px 24px 28px; text-align:center;">
      <p style="margin:0 0 12px 0; font-size:13px; color:#64748b;">You can track your inquiry status anytime:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/bulk"
         style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; font-size:13px; padding:12px 28px; border-radius:10px;">
        Track My Bulk Inquiry →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 28px; text-align:center;">
      <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#1e293b;">Kitchenbay B2B Sales Team</p>
      <p style="margin:0 0 4px 0; font-size:12px; color:#64748b;">Premium Traditional Indian Cookware & Decor</p>
      <p style="margin:6px 0 0 0; font-size:11px; color:#94a3b8;">📧 ${adminEmailsList[0]} &nbsp;|&nbsp; 🌐 kitchenbay.com</p>
    </div>

  </div>

</body>
</html>
    `;

    await transporter.sendMail({
      from: fromEmail,
      to: inquiry.email,
      subject: `📋 Your B2B Quotation #${inquiry.id} from Kitchenbay — ₹${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Grand Total`,
      html: quotationEmailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Quotation email sent to ${inquiry.email}`,
      inquiryId: inquiry.id,
      status: updatedInquiry.status,
    });
  } catch (err: any) {
    console.error('Send quotation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send quotation email' }, { status: 500 });
  }
}
