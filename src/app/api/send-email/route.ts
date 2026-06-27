/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminEmails } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { order, status } = await request.json();

    if (!order || !status) {
      return NextResponse.json({ error: 'Order and status are required' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || `"Kitchenbay Alerts" <alerts@Kitchenbay.com>`;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({
        error: 'SMTP_NOT_CONFIGURED',
        message: 'SMTP credentials are not configured. Please add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD to your .env file to send real email notifications.'
      }, { status: 400 });
    }

    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (transporterErr) {
      console.error('Error creating primary transporter, trying fallback...', transporterErr);
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Helper to format currency in INR
    const formatPrice = (p: number) =>
      'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(p);

    // Get email specific body text based on status
    const getEmailMessage = (status: string) => {
      switch (status.toLowerCase()) {
        case 'processing':
          return 'Excellent choice! Our master craftsmen are now preparing your hand-crafted items. We are making sure everything is checked and packed with the utmost care.';
        case 'shipped':
          return 'Great news! Your order has been handed over to our courier partner and is now in transit. A tracking number has been generated and your shipment is moving.';
        case 'delivered':
          return 'Your order has been successfully delivered to your doorstep. We hope these items bring joy, style, and beauty to your home.';
        case 'cancelled':
          return 'We are writing to confirm that your order has been cancelled. If a refund is applicable, it will be automatically processed to your original payment method in 5-7 business days.';
        default:
          return 'Your order status has been updated to: ' + status;
      }
    };

    let customerName = order.customer || 'Customer';
    let customerEmail = order.email;
    let subtotalRupees = order.subtotal;
    let totalRupees = order.total;
    let emailItems = order.items || [];

    try {
      const dbOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { user: true, items: true }
      });

      if (dbOrder) {
        customerName = order.customer || dbOrder.user?.name || 'Customer';
        customerEmail = order.email || dbOrder.user?.email || customerEmail;
        subtotalRupees = dbOrder.subtotalAmount / 100;
        totalRupees = dbOrder.totalAmount / 100;

        const productIds = dbOrder.items.map(item => item.productId);
        const dbProducts = await prisma.product.findMany({
          where: { id: { in: productIds } }
        });
        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        emailItems = dbOrder.items.map(item => {
          const product = productMap.get(item.productId);
          return {
            name: product ? product.name : 'Unknown Craft Item',
            quantity: item.quantity,
            price: item.price / 100, // convert to Rupees
            size: item.size
          };
        });
      } else {
        // Fallback: if values from request are raw paise, divide by 100
        if (subtotalRupees > 10000) subtotalRupees = subtotalRupees / 100;
        if (totalRupees > 10000) totalRupees = totalRupees / 100;
        emailItems = emailItems.map((item: any) => {
          let price = item.price || (item.product && (item.product.finalPrice || item.product.price));
          if (price > 1000) price = price / 100;
          return {
            name: item.name || (item.product && item.product.name) || 'Unknown Craft Item',
            quantity: item.quantity,
            price: price,
            size: item.size
          };
        });
      }
    } catch (dbErr) {
      console.error('Database fetch error in send-email:', dbErr);
      if (subtotalRupees > 10000) subtotalRupees = subtotalRupees / 100;
      if (totalRupees > 10000) totalRupees = totalRupees / 100;
      emailItems = emailItems.map((item: any) => {
        let price = item.price || (item.product && (item.product.finalPrice || item.product.price));
        if (price > 1000) price = price / 100;
        return {
          name: item.name || (item.product && item.product.name) || 'Unknown Craft Item',
          quantity: item.quantity,
          price: price,
          size: item.size
        };
      });
    }

    const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);
    const emailSubject = `Update: Your Order #${order.id} is now ${statusTitle}!`;

    // Map order items to list elements
    const itemsHtml = emailItems.map((item: any) => {
      const name = item.name;
      const qty = item.quantity;
      const price = item.price;
      return `
        <tr style="border-bottom: 1px solid #f1f1f1;">
          <td style="padding: 10px 0; font-size: 14px; color: #4b5563; text-align: left;">
            ${name} ${item.size ? `(${item.size})` : ''} <span style="color: #9ca3af; font-size: 12px;">× ${qty}</span>
          </td>
          <td style="padding: 10px 0; text-align: right; font-size: 14px; font-weight: 600; color: #1f2937;">
            ${formatPrice(price * qty)}
          </td>
        </tr>
      `;
    }).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="550" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <!-- Header Banner -->
                <tr>
                  <td align="center" style="background: linear-gradient(to right, #1D4ED8, #4f46e5); padding: 30px 40px; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">Kitchenbay</h1>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #ddd6fe;">The Home Needs</p>
                  </td>
                </tr>
                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px; text-align: left;">
                    <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: #1f2937;">Hello ${customerName},</h2>
                    <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                      ${getEmailMessage(status)}
                    </p>

                    <!-- Status Display -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 16px; text-align: left;">
                          <div style="font-size: 11px; color: #a78bfa; font-weight: 500; text-transform: uppercase;">New Status</div>
                          <div style="font-size: 16px; font-weight: bold; color: #1D4ED8; text-transform: uppercase; margin-top: 2px;">
                            ${status}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Items Summary -->
                    <h3 style="margin: 0 0 15px 0; font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; text-align: left;">Order Summary</h3>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px; border-collapse: collapse;">
                      ${itemsHtml}
                    </table>

                    <!-- Total Breakdown -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f1f1f1; padding-top: 15px; margin-bottom: 30px; font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280; text-align: left;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; color: #1f2937;">${formatPrice(subtotalRupees)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280; text-align: left;">Tax</td>
                        <td style="padding: 4px 0; text-align: right; color: #6b7280; font-size: 11px;">Inclusive of all taxes</td>
                      </tr>
                      <tr style="font-size: 15px; font-weight: bold;">
                        <td style="padding: 15px 0 0 0; color: #1f2937; border-top: 1px solid #f1f1f1; margin-top: 10px; text-align: left;">Total Paid</td>
                        <td style="padding: 15px 0 0 0; text-align: right; color: #1D4ED8; border-top: 1px solid #f1f1f1; margin-top: 10px;">
                          ${formatPrice(totalRupees)}
                        </td>
                      </tr>
                    </table>

                    <!-- Live Tracking Link -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f1f1f1; padding-top: 30px;">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 15px 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
                            Thank you for shopping with us and supporting regional Indian craftsmen. You can track your package details live at any time using your Order ID.
                          </p>
                          <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/orders/${order.id}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #1D4ED8; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">
                            Track Order Status Page
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #f9fafb; border-top: 1px solid #f1f1f1; padding: 20px 40px; font-size: 11px; color: #9ca3af;">
                    &copy; 2026 Kitchenbay Inc. 12 MG Road, Bangalore, India.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to: `${customerName} <${customerEmail}>`,
      bcc: getAdminEmails().join(','),
      subject: emailSubject,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    return NextResponse.json({ error: 'EMAIL_SEND_FAILED', message: error.message || 'Unknown error' }, { status: 500 });
  }
}
