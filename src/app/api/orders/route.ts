/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = clerkUser.fullName || clerkUser.username || email.split('@')[0];

  let user = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { clerkUserId: clerkUser.id, name }
      });
    } else {
      user = await prisma.user.create({
        data: { clerkUserId: clerkUser.id, email, name }
      });
    }
  }
  return user;
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
        } : null
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
    const { totalAmount, items, shippingAddrId, paymentStatus, razorpayId, address } = body;

    if (!items || !items.length) {
       return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    // ── Handle address: accept either shippingAddrId or an address object ──
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

    // Generate a random 6-digit numerical string
    const numericId = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await prisma.order.create({
      data: {
        id: numericId,
        userId: user.id,
        totalAmount,
        status: 'PENDING',
        paymentStatus: paymentStatus || 'PENDING',
        razorpayId: razorpayId || null,
        shippingAddrId: finalAddrId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true }
    });

    // Automatically clear user's cart if an order is created successfully
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
