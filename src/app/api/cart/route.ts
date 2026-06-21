/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
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

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    });

    return NextResponse.json(cart?.items || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Handle empty or malformed body
    }
    const { action, items, productId, quantity, size = "" } = body;

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    if (action === 'SYNC') {
      // Sync local items to DB
      if (Array.isArray(items)) {
        for (const item of items) {
          const itemSize = item.size || "";
          const existing = await prisma.cartItem.findUnique({
            where: { cartId_productId_size: { cartId: cart.id, productId: item.product.id, size: itemSize } }
          });
          if (existing) {
            await prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: Math.max(existing.quantity, item.quantity) }
            });
          } else {
            await prisma.cartItem.create({
              data: { cartId: cart.id, productId: item.product.id, quantity: item.quantity, size: itemSize }
            });
          }
        }
      }
    } else if (action === 'ADD') {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId_size: { cartId: cart.id, productId, size } }
      });
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + 1 }
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity: 1, size }
        });
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });
    return NextResponse.json(updatedCart?.items || []);
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity, size = "" } = await req.json();
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { cartId_productId_size: { cartId: cart.id, productId, size } }
      });
    } else {
      await prisma.cartItem.update({
        where: { cartId_productId_size: { cartId: cart.id, productId, size } },
        data: { quantity }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const size = searchParams.get('size') || "";
    
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    if (productId) {
      await prisma.cartItem.delete({
        where: { cartId_productId_size: { cartId: cart.id, productId, size } }
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
