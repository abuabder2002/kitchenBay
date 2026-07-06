import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const globalAny = globalThis as any;
if (!globalAny.contentCache) {
  globalAny.contentCache = {};
}
const contentCache = globalAny.contentCache;
const CACHE_TTL = 30000; // 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

    const now = Date.now();
    if (contentCache[page] && (now - contentCache[page].timestamp) < CACHE_TTL) {
      return NextResponse.json({ content: contentCache[page].data });
    }

    const content = await prisma.siteContent.findMany({
      where: { page }
    });

    contentCache[page] = { data: content, timestamp: now };

    const response = NextResponse.json({ content });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
