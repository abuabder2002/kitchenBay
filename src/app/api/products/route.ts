import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || searchParams.get('q')?.trim() || '';

  console.log(`[GET /api/products] search="${search}"`);

  try {
    const whereClause = search
      ? {
          OR: [
            { name:        { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { category:    { contains: search, mode: 'insensitive' as const } },
            { subcategory: { contains: search, mode: 'insensitive' as const } },
            { material:    { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[GET /api/products] search="${search}" → ${dbProducts.length} results`);

    const formattedProducts = dbProducts.map(p => {
      const basePrice = p.price / 100;
      const finalPrice = basePrice;
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
        height: p.height,
        width: p.width,
        length: p.length,
        diameter: p.diameter,
        weight: p.weight,
        sizeCategory: p.sizeCategory,
        tags: p.tags,
        image: p.image,
        subImages: p.subImages,
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured,
        variants: p.variants,
        isFromDb: true
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const priceInPaise = Math.round(data.price * 100);
    const originalPriceInPaise = data.originalPrice ? Math.round(data.originalPrice * 100) : null;

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: priceInPaise,
        discountPrice: originalPriceInPaise,
        gstPercent: data.gstPercent,
        stock: data.stock,
        category: data.category,
        subcategory: data.subcategory || data.category,
        material: data.material || 'Standard',
        dimensions: data.dimensions,
        height: data.height ? parseFloat(data.height) : null,
        width: data.width ? parseFloat(data.width) : null,
        length: data.length ? parseFloat(data.length) : null,
        diameter: data.diameter ? parseFloat(data.diameter) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        sizeCategory: data.sizeCategory || null,
        tags: data.tags || [],
        image: data.image,
        subImages: data.subImages || [],
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        featured: data.featured || false,
        variants: data.variants ? data.variants : undefined,
      }
    });

    const basePrice = newProduct.price / 100;
    const finalPrice = basePrice;
    const originalPrice = newProduct.discountPrice ? newProduct.discountPrice / 100 : finalPrice;
    const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

    return NextResponse.json({
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: basePrice,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      discount: discount,
      gstPercent: newProduct.gstPercent,
      stock: newProduct.stock,
      category: newProduct.category,
      subcategory: newProduct.subcategory || newProduct.category,
      material: newProduct.material || 'Standard',
      dimensions: newProduct.dimensions,
      height: newProduct.height,
      width: newProduct.width,
      length: newProduct.length,
      diameter: newProduct.diameter,
      weight: newProduct.weight,
      sizeCategory: newProduct.sizeCategory,
      tags: newProduct.tags,
      image: newProduct.image,
      subImages: newProduct.subImages,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      featured: newProduct.featured,
      variants: newProduct.variants,
      isFromDb: true
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
