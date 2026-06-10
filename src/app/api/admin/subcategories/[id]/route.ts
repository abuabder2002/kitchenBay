import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// PUT: Update a subcategory
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { name, categoryId, isActive } = body;
    const { id } = await params;

    if (!name?.trim()) return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: 'Parent category is required' }, { status: 400 });

    const slug = slugify(name.trim());

    const existing = await prisma.subcategory.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, categoryId, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'A subcategory with this name already exists in this category' }, { status: 409 });
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: { name: name.trim(), slug, categoryId, isActive: isActive ?? true },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('[PUT /api/admin/subcategories/[id]]', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}

// DELETE: Delete a subcategory
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await prisma.subcategory.delete({ where: { id } });
    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/admin/subcategories/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}
