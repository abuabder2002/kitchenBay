import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const params = await props.params;
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: { usages: true },
    });

    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('GET /api/admin/coupons/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const data = await request.json();
    
    // Convert strings to appropriate types safely
    const updateData: any = { ...data };
    if (updateData.value) updateData.value = parseInt(updateData.value);
    if (updateData.minOrderAmount) updateData.minOrderAmount = parseInt(updateData.minOrderAmount);
    if (updateData.maxDiscount) updateData.maxDiscount = parseInt(updateData.maxDiscount);
    if (updateData.usageLimit) updateData.usageLimit = parseInt(updateData.usageLimit);
    if (updateData.perUserLimit) updateData.perUserLimit = parseInt(updateData.perUserLimit);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const params = await props.params;
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('PUT /api/admin/coupons/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const params = await props.params;
    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/coupons/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
