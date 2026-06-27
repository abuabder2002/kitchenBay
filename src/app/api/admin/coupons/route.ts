import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const includeUsages = searchParams.get('includeUsages') === 'true';

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: includeUsages ? { _count: { select: { usages: true } } } : undefined,
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('GET /api/admin/coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await request.json();
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      applicableCategoryIds,
      applicableProductIds,
      excludedCategoryIds,
      excludedProductIds,
      eligibility,
      isActive,
      autoApply,
      campaignName,
    } = data;

    // Validate code uniqueness
    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value: parseInt(value),
        minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        applicableCategoryIds: applicableCategoryIds || [],
        applicableProductIds: applicableProductIds || [],
        excludedCategoryIds: excludedCategoryIds || [],
        excludedProductIds: excludedProductIds || [],
        eligibility: eligibility || 'EVERYONE',
        isActive: isActive !== undefined ? isActive : true,
        autoApply: autoApply || false,
        campaignName,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/coupons error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
