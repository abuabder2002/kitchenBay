/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { getDbUser } from '@/lib/serverAuth';

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
    const { items, address, shippingAmount = 99 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // ── Calculate totals from database product prices only ───
    let subtotalRupees = 0;
    let totalGstRupees = 0;
    const orderItems: { productId: string; quantity: number; price: number; basePrice: number; size?: string }[] = [];

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product "${item.productId}" not found` },
          { status: 400 }
        );
      }
      
      let basePrice = dbProduct.price / 100;
      let availableStock = dbProduct.stock;
      
      if (item.size && dbProduct.variants && (dbProduct.variants as Record<string, any>)[item.size]) {
        const variant = (dbProduct.variants as Record<string, any>)[item.size];
        basePrice = variant.price || (dbProduct.price / 100);
        availableStock = variant.stock || 0;
      }
      
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${dbProduct.name} ${item.size ? `(${item.size})` : ''}` },
          { status: 400 }
        );
      }

      const gstAmount = Math.round(basePrice * dbProduct.gstPercent) / 100;
      const unitPrice = basePrice + gstAmount;

      subtotalRupees += basePrice * item.quantity;
      totalGstRupees += gstAmount * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Math.round(unitPrice * 100), // stored in paise
        basePrice: Math.round(basePrice * 100), // stored in paise
        ...(item.size ? { size: item.size } : {})
      });
    }

    totalGstRupees = Math.round(totalGstRupees);
    const totalRupees = subtotalRupees + totalGstRupees + shippingAmount;

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
        totalAmount: Math.round(totalRupees * 100), // stored in paise
        subtotalAmount: Math.round(subtotalRupees * 100),
        gstAmount: Math.round(totalGstRupees * 100),
        shippingAmount: Math.round(shippingAmount * 100),
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
