import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { variantsToPaise, variantsToRupees, variantsToRupeesLite } from '@/lib/pricing';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || searchParams.get('q')?.trim() || '';
  const categoryParam = searchParams.get('category')?.trim() || '';
  const subcategoryParam = searchParams.get('subcategory')?.trim() || '';
  const featuredParam = searchParams.get('featured')?.trim() || '';
  const materialParam = searchParams.get('material')?.trim() || '';
  const brandParam = searchParams.get('brand')?.trim() || '';
  const idsParam = searchParams.get('ids')?.trim() || '';
  const sortByParam = searchParams.get('sortBy')?.trim() || '';

  const page = parseInt(searchParams.get('page') || '1') || 1;
  const limit = parseInt(searchParams.get('limit') || '100') || 100;
  const skip = (page - 1) * limit;
  const brandsOnly = searchParams.get('brandsOnly')?.trim() === 'true';

  console.log(`[GET /api/products] search="${search}", category="${categoryParam}", subcategory="${subcategoryParam}", page=${page}, limit=${limit}`);

  try {
    if (brandsOnly) {
      const distinctBrands = await prisma.product.findMany({
        where: { brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
      });
      const response = NextResponse.json(
        Array.from(new Set(distinctBrands.map(b => b.brand).filter(Boolean)))
      );
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
      return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      whereClause.id = { in: ids };
    }
    
    const inStockParam = searchParams.get('inStock')?.trim() || '';
    const minPriceParam = parseFloat(searchParams.get('minPrice') || '');
    const maxPriceParam = parseFloat(searchParams.get('maxPrice') || '');

    if (search) {
      whereClause.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category:    { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } },
        { material:    { contains: search, mode: 'insensitive' } },
        { brand:       { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (categoryParam) {
      whereClause.category = { equals: categoryParam, mode: 'insensitive' };
    }
    
    if (subcategoryParam) {
      whereClause.subcategory = { equals: subcategoryParam, mode: 'insensitive' };
    }

    if (featuredParam === 'true') {
      whereClause.featured = true;
    }

    if (materialParam) {
      whereClause.material = { equals: materialParam, mode: 'insensitive' };
    }

    if (brandParam) {
      whereClause.brand = { equals: brandParam, mode: 'insensitive' };
    }

    if (inStockParam === 'true') {
      whereClause.stock = { gt: 0 };
    }

    if (!isNaN(minPriceParam) || !isNaN(maxPriceParam)) {
      whereClause.price = {};
      if (!isNaN(minPriceParam)) {
        whereClause.price.gte = Math.round(minPriceParam * 100);
      }
      if (!isNaN(maxPriceParam)) {
        whereClause.price.lt = Math.round(maxPriceParam * 100);
      }
    }

    let orderClause: any = { createdAt: 'desc' };
    if (sortByParam === 'price-asc') {
      orderClause = { price: 'asc' };
    } else if (sortByParam === 'price-desc') {
      orderClause = { price: 'desc' };
    } else if (sortByParam === 'popular') {
      orderClause = { reviewCount: 'desc' };
    }

    // Both queries hit the same DB; run them concurrently so we pay the
    // network round-trip once instead of twice.
    // Select only columns needed for the list view to reduce bandwidth usage
    const [dbProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
      where: whereClause,
      orderBy: orderClause,
      skip,
      take: limit,
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
        shippingFee: true,
        shippingMethod: true,
        isActive: true,
        video: true,
        sizeCategory: true,
        variants: true,
        attributes: true,
      }
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    console.log(`[GET /api/products] page=${page} limit=${limit} → ${dbProducts.length} results (total: ${totalCount})`);

    const formattedProducts = dbProducts.map(p => {
      const basePrice = p.price / 100;
      const finalPrice = basePrice;
      const originalPrice = p.discountPrice ? p.discountPrice / 100 : finalPrice;
      const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: '', // description is large, exclude from list mode
        price: basePrice,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        discount: discount,
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
        sizeCategory: p.sizeCategory || null,
        tags: [],
        image: p.image,
        subImages: [], // OMIT to prevent 4.5MB Vercel limit
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured,
        // Price/stock only — per-size images are base64 data URLs, same 4.5MB risk as subImages, so they're stripped here
        variants: variantsToRupeesLite(p.variants as Record<string, any> | null),
        attributes: (p.attributes as any) || undefined,
        isFromDb: true,
        brand: p.brand || undefined,
        shippingFee: p.shippingFee !== null && p.shippingFee !== undefined ? p.shippingFee / 100 : undefined,
        shippingMethod: p.shippingMethod || undefined,
        video: p.video || undefined,
      };
    });

    const response = NextResponse.json(formattedProducts);
    response.headers.set('X-Total-Count', totalCount.toString());
    // Serve stale for a day while revalidating in the background, so a cache
    // miss is rare and a slow origin fetch never blocks a shopper.
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: (error as Error)?.message || String(error) }, { status: 500 });
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
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
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
        variants: data.variants ? variantsToPaise(data.variants) : undefined,
        attributes: data.attributes ? data.attributes : undefined,
        brand: data.brand || null,
        shippingFee: data.shippingFee !== undefined && data.shippingFee !== null ? Math.round(parseFloat(data.shippingFee) * 100) : null,
        shippingMethod: data.shippingMethod || null,
        video: data.video || null,
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
      variants: variantsToRupees(newProduct.variants as Record<string, any> | null),
      attributes: newProduct.attributes,
      isFromDb: true,
      brand: newProduct.brand || undefined,
      shippingFee: newProduct.shippingFee !== null && newProduct.shippingFee !== undefined ? newProduct.shippingFee / 100 : undefined,
      shippingMethod: newProduct.shippingMethod || undefined,
      video: newProduct.video || undefined,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
