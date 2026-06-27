import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orderId = "962486";
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: order.userId }
    });

    // Run the exact mapping logic
    const productIds = order.items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
        discountPrice: true
      }
    });

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    const populatedItems = order.items.map(item => {
      const dbProd = productMap.get(item.productId);
      return {
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        basePrice: item.basePrice,
        size: item.size,
        product: dbProd ? {
          id: dbProd.id,
          name: dbProd.name,
          image: dbProd.image,
          price: dbProd.price / 100,
          finalPrice: dbProd.discountPrice ? dbProd.discountPrice / 100 : dbProd.price / 100
        } : null
      };
    });

    const frontendStatus = order.status.toLowerCase();

    const orderData = {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      subtotalAmount: order.subtotalAmount,
      gstAmount: order.gstAmount,
      shippingAmount: order.shippingAmount,
      status: frontendStatus,
      razorpayId: order.razorpayId,
      paymentStatus: order.paymentStatus,
      shippingAddrId: order.shippingAddrId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: populatedItems
    };

    return NextResponse.json({ user, orderData, dbProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
