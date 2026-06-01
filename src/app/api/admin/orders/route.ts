/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { products } from '@/lib/mockData';

async function verifyAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { error: 'Please sign in to continue', status: 401 };

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: 'Clerk email address not found', status: 401 };

  const user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abdershaheen4@gmail.com';
  
  if (!user || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return { error: 'Unauthorized: Admin privileges required', status: 403 };
  }

  return { user, email };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    interface AdminOrder {
      id: string;
      shippingAddrId: string | null;
      totalAmount: number;
      paymentStatus: string;
      status: string;
      createdAt: Date;
      items: any[];
      user: {
        name: string | null;
        email: string;
      };
    }

    // Fetch all orders in the entire database
    const orders: AdminOrder[] = await prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch shipping addresses for all orders
    const addressIds = orders.map(o => o.shippingAddrId).filter(Boolean) as string[];
    const addresses = await prisma.address.findMany({
      where: { id: { in: addressIds } }
    });
    const addressMap = new Map(addresses.map(a => [a.id, a]));

    // Map database orders to the shape required by the Admin UI
    const mappedOrders = orders.map(o => {
      const address = o.shippingAddrId ? addressMap.get(o.shippingAddrId) : null;
      
      const mappedItems = o.items.map((i: any) => {
        const prod = products.find(p => p.id === i.productId);
        return {
          productId: i.productId,
          name: prod ? prod.name : i.productId,
          quantity: i.quantity,
          price: i.price,
        };
      });

      // Calculate taxes dynamically matching context logic
      const subtotal = mappedItems.reduce((sum: number, item: any) => {
        const prod = products.find(p => p.id === item.productId);
        const basePrice = prod ? prod.price : Math.round(item.price / 1.18);
        return sum + basePrice * item.quantity;
      }, 0);

      const gstAmount = o.totalAmount - subtotal;
      const cgstAmount = Math.floor(gstAmount / 2);
      const sgstAmount = gstAmount - cgstAmount;

      return {
        id: o.id,
        customer: o.user.name || o.user.email.split('@')[0] || 'Customer',
        email: o.user.email,
        phone: '', // Placeholder if not stored in user profile directly
        address: address ? `${address.street}, ${address.city}, ${address.state} - ${address.zip}` : 'No address provided',
        items: mappedItems,
        subtotal,
        cgstAmount,
        sgstAmount,
        gstAmount,
        total: o.totalAmount,
        paymentMethod: o.paymentStatus,
        status: o.status.toLowerCase(), // Frontend matches lowercase enum string
        date: o.createdAt.toISOString(),
      };
    });

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Convert frontend lowercase status back to DB uppercase OrderStatus enum
    const dbStatus = status.toUpperCase();

    // Update order status in PostgreSQL database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: dbStatus },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
