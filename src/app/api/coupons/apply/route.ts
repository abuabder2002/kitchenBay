import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUser } from '@/lib/serverAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { code, subtotal } = body;
    
    // Convert frontend subtotal (Rupees) to paise if needed, or assume it's already computed.
    // We will assume the frontend sends the subtotal in Rupees based on CartContext, so we convert it to Paise.
    const subtotalPaise = Math.round(subtotal * 100);

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Code and subtotal are required' }, { status: 400 });
    }
    
    code = code.toUpperCase();

    const user = await getDbUser(); // Optional: user might be guest

    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        _count: { select: { usages: true } },
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({ error: 'Coupon is not yet active' }, { status: 400 });
    }
    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.minOrderAmount && subtotalPaise < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order amount of Rs. ${coupon.minOrderAmount / 100} is required` }, { status: 400 });
    }

    if (coupon.usageLimit && coupon._count.usages >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    if (coupon.eligibility === 'NEW_USER') {
      if (!user) return NextResponse.json({ error: 'Please login to use this coupon' }, { status: 401 });
      const ordersCount = await prisma.order.count({ where: { userId: user.id } });
      if (ordersCount > 0) {
        return NextResponse.json({ error: 'Coupon is only valid for new users' }, { status: 400 });
      }
    }

    if (user && coupon.perUserLimit) {
      const userUsages = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: user.id }
      });
      if (userUsages >= coupon.perUserLimit) {
        return NextResponse.json({ error: 'You have exceeded the usage limit for this coupon' }, { status: 400 });
      }
    }

    // Calculate discount amount in paise
    let discountAmount = 0;
    if (coupon.type === 'FIXED') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotalPaise * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FREE_SHIPPING') {
      discountAmount = 9900; // Free shipping cancels out the Rs.99 shipping fee
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotalPaise && coupon.type !== 'FREE_SHIPPING') {
      discountAmount = subtotalPaise;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountAmount, // In paise
      }
    });

  } catch (error) {
    console.error('POST /api/coupons/apply error:', error);
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 });
  }
}
