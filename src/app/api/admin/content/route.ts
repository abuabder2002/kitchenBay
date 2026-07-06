import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUser } from '@/lib/serverAuth';

export async function PUT(request: Request) {
  try {
    // Admin check is mostly handled by middleware.ts, but we do a basic auth check here
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body as { updates: { page: string, section: string, key: string, value: string, type?: string }[] };

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Upsert each item
    const results = await prisma.$transaction(
      updates.map((update) =>
        prisma.siteContent.upsert({
          where: {
            page_section_key: {
              page: update.page,
              section: update.section,
              key: update.key,
            },
          },
          update: {
            value: update.value,
            type: update.type || 'TEXT',
          },
          create: {
            page: update.page,
            section: update.section,
            key: update.key,
            value: update.value,
            type: update.type || 'TEXT',
          },
        })
      )
    );

    // Clear in-memory content cache to reflect changes immediately
    const globalAny = globalThis as any;
    if (globalAny.contentCache) {
      globalAny.contentCache = {};
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error updating site content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
