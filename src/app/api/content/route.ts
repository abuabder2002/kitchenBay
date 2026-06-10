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

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
