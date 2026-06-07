import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET: List all subcategories (optionally filtered by categoryId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [subcategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where,
        include: { category: { select: { id: true, name: true } }, _count: { select: { products: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subcategory.count({ where }),
    ]);

    return NextResponse.json({ subcategories, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/admin/subcategories]', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

// POST: Create a subcategory
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, isActive } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: 'Parent category is required' }, { status: 400 });

    const slug = slugify(name.trim());

    const existing = await prisma.subcategory.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, categoryId },
    });
    if (existing) {
      return NextResponse.json({ error: 'A subcategory with this name already exists in the selected category' }, { status: 409 });
    }

    const subcategory = await prisma.subcategory.create({
      data: { name: name.trim(), slug, categoryId, isActive: isActive ?? true },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/subcategories]', error);
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}
