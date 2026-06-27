import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

    const content = await prisma.siteContent.findMany({
      where: { page }
    });

    const response = NextResponse.json({ content });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
