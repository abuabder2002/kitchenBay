/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const productIds = order.items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    const address = order.shippingAddrId
      ? await prisma.address.findUnique({ where: { id: order.shippingAddrId } })
      : null;

    const items = order.items.map(item => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name || item.productId,
        image: product?.image || null,
        quantity: item.quantity,
        price: item.price / 100,
        basePrice: item.basePrice / 100,
        size: item.size,
        gstPercent: product?.gstPercent ?? 5,
      };
    });

    const subtotalRupees = order.subtotalAmount / 100;
    const gstRupees = order.gstAmount / 100;
    const shippingRupees = order.shippingAmount / 100;
    const discountRupees = order.discountAmount / 100;
    const totalRupees = order.totalAmount / 100;

    // First-order discount is not stored separately; back-calculate it from the totals
    const impliedDiscount = Math.round((subtotalRupees + shippingRupees - discountRupees - totalRupees) * 100) / 100;
    const firstOrderDiscountRupees = impliedDiscount > 0.5 ? impliedDiscount : 0;

    return NextResponse.json({
      id: order.id,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus,
      razorpayId: order.razorpayId,
      couponCode: order.couponCode,
      createdAt: order.createdAt,
      customer: order.user?.name || 'Customer',
      email: order.user?.email || '',
      address: address ? {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      } : null,
      items,
      subtotal: subtotalRupees,
      gstAmount: gstRupees,
      shippingAmount: shippingRupees,
      discountAmount: discountRupees,
      firstOrderDiscount: firstOrderDiscountRupees,
      total: totalRupees,
    });
  } catch (error: any) {
    console.error('Error fetching admin order:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}
