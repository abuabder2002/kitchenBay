/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDbUser } from '@/lib/serverAuth';
import { prisma } from '@/lib/prisma';

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
    const { 
      items, 
      shippingAddrId, 
      paymentStatus, 
      razorpayId, 
      address 
    } = body;

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

    // ── Recalculate totals from database product prices securely ──
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let calculatedSubtotalRupees = 0;
    let calculatedGstRupees = 0;
    const dbOrderItems = [];
    const shippingFees: number[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product "${item.productId}" not found` }, { status: 400 });
      }
      
      let basePrice = dbProduct.price / 100;
      let availableStock = dbProduct.stock;
      
      if (item.size && dbProduct.variants && (dbProduct.variants as Record<string, any>)[item.size]) {
        const variant = (dbProduct.variants as Record<string, any>)[item.size];
        basePrice = variant.price || (dbProduct.price / 100);
        availableStock = variant.stock || 0;
      }
      
      if (availableStock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${dbProduct.name}` }, { status: 400 });
      }

      const gstAmount = Math.round(basePrice * dbProduct.gstPercent) / 100;
      const unitPrice = basePrice + gstAmount;

      calculatedSubtotalRupees += basePrice * item.quantity;
      calculatedGstRupees += gstAmount * item.quantity;

      // Shipping fee lookup for this product
      let fee = 99;
      if (dbProduct.shippingFee !== undefined && dbProduct.shippingFee !== null) {
        if (dbProduct.shippingFee > 1000) {
          fee = Math.round(dbProduct.shippingFee / 100);
        } else {
          fee = dbProduct.shippingFee;
        }
      }
      shippingFees.push(fee);

      dbOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Math.round(unitPrice * 100), // stored in paise
        basePrice: Math.round(basePrice * 100), // stored in paise
        size: item.size || ""
      });
    }

    calculatedGstRupees = Math.round(calculatedGstRupees);
    let calculatedShippingRupees = 99;
    if (items.length > 0) {
      if (calculatedSubtotalRupees >= 2000) {
        calculatedShippingRupees = 0;
      } else {
        calculatedShippingRupees = 99;
      }
    }

    // ── Calculate discounts and final total ──
    const completedOrdersCount = await prisma.order.count({
      where: {
        userId: user.id,
        OR: [
          { paymentStatus: 'PAID' },
          { paymentStatus: 'COD_PENDING' },
          { status: 'PROCESSING' },
          { status: 'DELIVERED' }
        ]
      }
    });
    const isFirstOrder = completedOrdersCount === 0;
    const firstOrderDiscount = isFirstOrder ? Math.min(100, calculatedSubtotalRupees) : 0;
    const discountedSubtotal = calculatedSubtotalRupees - firstOrderDiscount;
    const calculatedGstRupeesCheckout = Math.round(discountedSubtotal * 0.05);
    
    // Check if COD is used
    const isCod = paymentStatus === 'COD_PENDING';
    const netBankingDiscount = (!isCod && razorpayId) ? Math.round((discountedSubtotal + calculatedGstRupeesCheckout) * 0.02) : 0;
    
    const totalSavings = firstOrderDiscount + netBankingDiscount;
    const finalPayableRupees = Math.max(0, discountedSubtotal + calculatedGstRupeesCheckout + calculatedShippingRupees - netBankingDiscount);

    // ── Enforce COD Limit of Rs:5999 ──
    if (isCod && finalPayableRupees > 5999) {
      return NextResponse.json({ error: 'There is no COD above Rs:5999. Please choose Net Banking or card payment.' }, { status: 400 });
    }

    // Generate a random 6-digit numerical string
    const numericId = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await prisma.order.create({
      data: {
        id: numericId,
        userId: user.id,
        totalAmount: Math.round(finalPayableRupees * 100), // convert to paise
        subtotalAmount: Math.round(calculatedSubtotalRupees * 100),
        gstAmount: Math.round(calculatedGstRupeesCheckout * 100),
        shippingAmount: Math.round(calculatedShippingRupees * 100),
        status: 'PENDING',
        paymentStatus: paymentStatus || 'PENDING',
        razorpayId: razorpayId || null,
        shippingAddrId: finalAddrId,
        items: {
          create: dbOrderItems
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
