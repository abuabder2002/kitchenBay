import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  console.log(`[GET /api/search] query="${q}"`);

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    // Broad OR search across name, description, category, subcategory, material
    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name:        { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category:    { contains: q, mode: 'insensitive' } },
          { subcategory: { contains: q, mode: 'insensitive' } },
          { material:    { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        gstPercent: true,
        stock: true,
        category: true,
        subcategory: true,
        material: true,
        image: true,
        rating: true,
        reviewCount: true,
        featured: true,
        brand: true,
        isActive: true,
      }
    });

    console.log(`[GET /api/search] query="${q}" → ${dbProducts.length} results`);

    const formatted = dbProducts.map(p => {
      const basePrice = p.price / 100;
      const finalPrice = basePrice;
      const originalPrice = p.discountPrice ? p.discountPrice / 100 : finalPrice;
      const discount = originalPrice > finalPrice
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0;

      return {
        id: p.id,
        name: p.name,
        description: '',
        price: basePrice,
        originalPrice,
        finalPrice,
        discount,
        gstPercent: p.gstPercent,
        stock: p.stock,
        category: p.category,
        subcategory: p.subcategory || p.category,
        material: p.material || 'Standard',
        dimensions: null,
        height: null,
        width: null,
        length: null,
        diameter: null,
        weight: null,
        sizeCategory: null,
        tags: [],
        image: p.image,
        subImages: [],
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured,
        variants: null,
        isFromDb: true,
      };
    });

    const response = NextResponse.json(formatted);
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('[GET /api/search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
