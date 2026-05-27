import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

/**
 * POST /api/checkout/verify
 *
 * Verifies the Razorpay payment signature (HMAC-SHA256),
 * marks the order as PAID / PROCESSING, and clears the user's cart.
 *
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    // ── Signature verification ──────────────────────────────
    const keySecret = (process.env.RAZORPAY_KEY_SECRET ?? '').replace(/"/g, '').trim();

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      // Mark order as failed
      await prisma.order.updateMany({
        where: { razorpayId: razorpay_order_id },
        data: { paymentStatus: 'FAILED' },
      });
      return NextResponse.json(
        { error: 'Payment verification failed — signature mismatch' },
        { status: 400 }
      );
    }

    // ── Find & update order ─────────────────────────────────
    const order = await prisma.order.findUnique({
      where: { razorpayId: razorpay_order_id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      include: { items: true },
    });

    // ── Clear user's cart ───────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (user) {
      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    // ── Fetch address for response ──────────────────────────
    let address = null;
    if (updated.shippingAddrId) {
      address = await prisma.address.findUnique({
        where: { id: updated.shippingAddrId },
      });
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      orderId: updated.id,
      paymentId: razorpay_payment_id,
      status: 'PAID',
      totalAmount: updated.totalAmount,
      items: updated.items,
      address: address
        ? {
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
