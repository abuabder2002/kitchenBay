/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDbUser } from '@/lib/serverAuth';
import { prisma } from '@/lib/prisma';
import { calcCheckoutPricing, SHIPPING_FEE_RUPEES } from '@/lib/checkoutPricing';

/** Derive shipping fee in Rupees from a DB product's shippingFee (stored in paise).
 *  Falls back to SHIPPING_FEE_RUPEES (₹99) when not configured. */
function getDbProductShippingFee(product: { shippingFee: number | null }): number {
  if (product.shippingFee === null || product.shippingFee === undefined) {
    return SHIPPING_FEE_RUPEES;
  }
  // DB stores in paise; values > 1000 are definitely paise, otherwise already rupees
  return product.shippingFee > 1000
    ? Math.round(product.shippingFee / 100)
    : product.shippingFee;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    // ── Enrich items with product name & image in one batch query ──
    const allProductIds = Array.from(
      new Set(orders.flatMap(o => o.items.map(i => i.productId)))
    );
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, name: true, image: true }
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    const addressIds = orders.map(o => o.shippingAddrId).filter(Boolean) as string[];
    const addresses = await prisma.address.findMany({
      where: { id: { in: addressIds } }
    });
    const addressMap = new Map(addresses.map(a => [a.id, a]));

    const ordersWithAddress = orders.map(o => {
      const address = o.shippingAddrId ? addressMap.get(o.shippingAddrId) : null;
      return {
        ...o,
        address: address ? {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country
        } : null,
        items: o.items.map(item => {
          const prod = productMap.get(item.productId);
          return {
            ...item,
            name: prod?.name ?? item.productId,
            image: prod?.image ?? null,
          };
        }),
      };
    });

    return NextResponse.json(ordersWithAddress);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      shippingAddrId,
      paymentStatus,
      razorpayId,
      address,
      couponCode,
      discountAmount = 0   // in PAISE
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    // ── Handle address ──────────────────────────────────────
    let finalAddrId: string | null = shippingAddrId || null;

    if (!finalAddrId && address && address.street) {
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
      finalAddrId = addr.id;
    }

    // ── Recalculate subtotal from DB (authoritative) ────────
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let subtotalRupees = 0;
    const dbOrderItems = [];
    const productShippingFees: number[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product "${item.productId}" not found` }, { status: 400 });
      }

      let basePrice = dbProduct.price / 100; // paise → rupees
      let availableStock = dbProduct.stock;

      if (item.size && dbProduct.variants && (dbProduct.variants as Record<string, any>)[item.size]) {
        const variant = (dbProduct.variants as Record<string, any>)[item.size];
        basePrice = variant.price ? variant.price / 100 : (dbProduct.price / 100); // variant.price stored in paise
        availableStock = variant.stock || 0;
      }

      if (availableStock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${dbProduct.name}` }, { status: 400 });
      }

      subtotalRupees += basePrice * item.quantity;
      productShippingFees.push(getDbProductShippingFee(dbProduct));

      dbOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Math.round(basePrice * 100),     // paise (no GST in line item)
        basePrice: Math.round(basePrice * 100), // paise
        size: item.size || ''
      });
    }

    // ── First-order status ──────────────────────────────────
    const completedOrdersCount = await prisma.order.count({
      where: {
        userId: user.id,
        OR: [
          { paymentStatus: 'PAID' },
          { paymentStatus: 'COD_PENDING' },
          { status: 'PROCESSING' },
          { status: 'DELIVERED' }
        ]
      }
    });
    const isFirstOrder = completedOrdersCount === 0;
    const isCod = paymentStatus === 'COD_PENDING';

    // ── Shipping fee: max product-specific fee (authoritative from DB) ──
    const shippingFeeRupees = productShippingFees.length > 0
      ? Math.max(...productShippingFees)
      : SHIPPING_FEE_RUPEES;

    // ── Canonical pricing via shared utility ────────────────
    const pricing = calcCheckoutPricing(subtotalRupees, {
      isFirstOrder,
      couponDiscountRupees: discountAmount / 100,   // paise → rupees
      paymentMethod: isCod ? 'COD' : 'RAZORPAY',
      shippingFeeRupees,
    });

    // ── Enforce COD limit ───────────────────────────────────
    if (isCod && pricing.payableTotal > 5999) {
      return NextResponse.json(
        { error: 'COD is not available above ₹5,999. Please choose online payment.' },
        { status: 400 }
      );
    }

    // ── Generate numeric order ID ───────────────────────────
    const numericId = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await prisma.order.create({
      data: {
        id: numericId,
        userId: user.id,
        totalAmount: Math.round(pricing.payableTotal * 100),
        subtotalAmount: Math.round(pricing.subtotal * 100),
        gstAmount: Math.round(pricing.gstAmount * 100),
        shippingAmount: Math.round(pricing.shippingFeeRupees * 100),
        discountAmount: discountAmount,   // stored in paise
        couponCode: couponCode || null,
        status: 'PENDING',
        paymentStatus: paymentStatus || 'PENDING',
        razorpayId: razorpayId || null,
        shippingAddrId: finalAddrId,
        items: {
          create: dbOrderItems
        }
      },
      include: { items: true }
    });

    // ── Clear server-side cart ──────────────────────────────
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
