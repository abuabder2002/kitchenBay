import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUser } from '@/lib/serverAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const { searchParams } = new URL(req.url);
  const contact = searchParams.get('contact')?.trim().toLowerCase() || '';

  try {
    // Fetch the order with its items and user details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate access authorization
    let authorized = false;

    // Check if the current logged-in user owns the order
    const user = await getDbUser();
    if (user && order.userId === user.id) {
      authorized = true;
    } else if (contact) {
      // Otherwise, match email provided in searchParams for anonymous/guest tracking
      const orderEmail = (order.user?.email || '').toLowerCase();

      if (orderEmail === contact) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 401 });
    }

    // Fetch products referenced by order items to populate name & image
    const productIds = order.items.map(i => i.productId.replace('/products/', ''));
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
    const productMap = new Map(dbProducts.map(p => [p.id.replace('/products/', ''), p]));

    const populatedItems = order.items.map(item => {
      const cleanProductId = item.productId.replace('/products/', '');
      const dbProd = productMap.get(cleanProductId);
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

    // Fetch the delivery address
    let shippingAddress = null;
    if (order.shippingAddrId) {
      const address = await prisma.address.findUnique({
        where: { id: order.shippingAddrId }
      });
      if (address) {
        shippingAddress = {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country
        };
      }
    }

    // Map order status string to lowercase for compatibility with the frontend step indexers
    const frontendStatus = order.status.toLowerCase();

    // Construct a plain JSON object to bypass Prisma's custom toJSON() serializer
    const orderData = {
      id: order.id,
      userId: order.userId,
      customerName: order.user?.name || 'Customer',
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
      items: populatedItems,
      address: shippingAddress
    };

    console.log("[GET /api/orders/" + orderId + "] Returned OrderData:", JSON.stringify(orderData, null, 2));

    return NextResponse.json(orderData);
  } catch (error) {
    console.error(`[GET /api/orders/${orderId}] Error:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
