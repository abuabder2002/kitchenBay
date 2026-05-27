import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const videos = await prisma.traditionVideo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(videos, {
      headers: {
        // Cache for 60 s; serve stale for up to 5 min while revalidating in background
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const video = await prisma.traditionVideo.create({
      data: {
        videoUrl: data.videoUrl,
        title: data.title,
        thumbnail: data.thumbnail,
        link: data.link
      }
    });
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
