/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { products as productCatalog } from '@/lib/mockData';

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
  return user;
}

/**
 * POST /api/checkout/razorpay
 *
 * Creates a Razorpay order and a matching pending DB order.
 *
 * Body: {
 *   items: [{ productId: string, quantity: number }],
 *   address: { street: string, city: string, state: string, zip: string }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const body = await req.json();
    const { items, address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // ── Calculate total from server-side product catalog ────
    const catalogMap = new Map(productCatalog.map(p => [p.id, p]));
    let totalRupees = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = catalogMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.productId}" not found in catalog` },
          { status: 400 }
        );
      }
      const unitPrice = product.finalPrice; // What the customer pays (rupees)
      totalRupees += unitPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    // ── Save shipping address ───────────────────────────────
    let shippingAddrId: string | null = null;
    if (address?.street) {
      const addr = await prisma.address.create({
        data: {
          userId: user.id,
          street: address.street,
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          country: 'India',
        },
      });
      shippingAddrId = addr.id;
    }

    // ── Razorpay credentials check ──────────────────────────
    let keyId = (process.env.RAZORPAY_KEY_ID ?? '').replace(/"/g, '').trim();
    let keySecret = (process.env.RAZORPAY_KEY_SECRET ?? '').replace(/"/g, '').trim();

    const storeSettings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (storeSettings?.razorpayKeyId && storeSettings?.razorpayKeySecret) {
      keyId = storeSettings.razorpayKeyId;
      keySecret = storeSettings.razorpayKeySecret;
    }

    if (!keyId || !keySecret || keyId.includes('YOUR_KEY') || keySecret.includes('YOUR_')) {
      return NextResponse.json(
        {
          error:
            'Razorpay is not configured. Add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env — get them from https://dashboard.razorpay.com → Settings → API Keys.',
        },
        { status: 500 }
      );
    }

    // ── Create Razorpay order (amount must be in PAISE) ─────
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountPaise = Math.round(totalRupees * 100);

    const razorpayOrder = await (razorpay.orders as any).create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // ── Persist order in DB ─────────────────────────────────
    const numericId = Math.floor(100000 + Math.random() * 900000).toString();

    const dbOrder = await prisma.order.create({
      data: {
        id: numericId,
        userId: user.id,
        totalAmount: totalRupees,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        razorpayId: razorpayOrder.id,
        shippingAddrId,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return NextResponse.json({
      keyId,
      amount: amountPaise,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      dbOrderId: dbOrder.id,
    });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    const msg =
      err?.error?.description || err?.message || 'Failed to create payment order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
