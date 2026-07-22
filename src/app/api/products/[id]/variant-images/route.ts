import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Lightweight endpoint: returns only { size: image } for a product's variants.
// Kept separate from GET /api/products/[id] so product-card size chips can
// lazy-load just the images they need without pulling the full product record.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const variants = product.variants as Record<string, { image?: string }> | null;
    const images = variants
      ? Object.fromEntries(
          Object.entries(variants)
            .filter(([, data]) => !!data?.image)
            .map(([size, data]) => [size, data.image])
        )
      : {};

    const response = NextResponse.json({ images });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    return response;
  } catch (error) {
    console.error('Error fetching variant images:', error);
    return NextResponse.json({ error: 'Failed to fetch variant images' }, { status: 500 });
  }
}
