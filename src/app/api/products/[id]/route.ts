/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json();
    const { id } = await params;
    
    // Check if the product exists in DB before updating
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    const priceInPaise = data.price !== undefined ? Math.round(data.price * 100) : undefined;
    const originalPriceInPaise = data.originalPrice !== undefined ? Math.round(data.originalPrice * 100) : undefined;

    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.originalPrice;
    delete updateData.finalPrice;
    delete updateData.isFromDb;
    delete updateData.discount;
    
    if (priceInPaise !== undefined) updateData.price = priceInPaise;
    if (originalPriceInPaise !== undefined) updateData.discountPrice = originalPriceInPaise;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
