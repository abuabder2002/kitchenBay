/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getDbUser } from '@/lib/serverAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: { items: true }
    });

    if (!wishlist || !wishlist.items.length) {
      return NextResponse.json([]);
    }

    const productIds = wishlist.items.map(item => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const formattedProducts = dbProducts.map(p => {
      const basePrice = p.price / 100;
      const gstAmount = Math.round(basePrice * p.gstPercent / 100);
      const finalPrice = basePrice + gstAmount;
      const originalPrice = p.discountPrice ? p.discountPrice / 100 : finalPrice;
      const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: basePrice,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        discount: discount,
        gstPercent: p.gstPercent,
        stock: p.stock,
        category: p.category,
        subcategory: p.subcategory || p.category,
        material: p.material || 'Standard',
        dimensions: p.dimensions,
        tags: p.tags,
        image: p.image,
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured,
        isFromDb: true
      };
    });

    // Handle mock products fallback for products that exist in user's wishlist
    // but not in the PostgreSQL Database
    const dbProductIds = new Set(dbProducts.map(p => p.id));
    const missingProductIds = productIds.filter(id => !dbProductIds.has(id));

    if (missingProductIds.length > 0) {
      const { products: mockProducts } = await import('@/lib/mockData');
      const missingProducts = missingProductIds
        .map(id => mockProducts.find(p => p.id === id))
        .filter(Boolean);
      formattedProducts.push(...(missingProducts as any[]));
    }

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    let wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: user.id } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
       return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (!wishlist) return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
