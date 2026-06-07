import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET: List all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: { _count: { select: { subcategories: true, products: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({ categories, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST: Create a category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, image, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = slugify(name.trim());

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: { equals: name.trim(), mode: 'insensitive' } }, { slug }] },
    });
    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, image: image || null, isActive: isActive ?? true },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
