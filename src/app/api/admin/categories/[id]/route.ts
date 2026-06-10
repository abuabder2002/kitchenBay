import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// PUT: Update a category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { name, image, isActive } = body;
    const { id } = await params;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = slugify(name.trim());

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: { equals: name.trim(), mode: 'insensitive' } }, { slug }],
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug, image: image || null, isActive: isActive ?? true },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('[PUT /api/admin/categories/[id]]', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: Delete a category
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/admin/categories/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
