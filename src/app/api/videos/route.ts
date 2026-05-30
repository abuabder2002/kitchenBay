import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const videos = await prisma.traditionVideo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error('[GET /api/videos]', error);
    return NextResponse.json({ error: 'Failed to fetch videos', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // ── FILE UPLOAD (FormData) ─────────────────────────────────────────
      const formData = await req.formData();
      const title     = formData.get('title') as string;
      const link      = formData.get('link') as string | null;
      const videoFile = formData.get('videoFile') as File | null;
      const thumbFile = formData.get('thumbnailFile') as File | null;
      const videoUrl  = formData.get('videoUrl') as string | null;
      const thumbnail = formData.get('thumbnail') as string | null;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      let finalVideoUrl  = videoUrl || '';
      let finalThumbnail = thumbnail || '';

      if (videoFile && videoFile.size > 0) {
        const ext = path.extname(videoFile.name) || '.mp4';
        const fileName = `video_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        const buf = await videoFile.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buf));
        finalVideoUrl = `/uploads/${fileName}`;
      }

      if (thumbFile && thumbFile.size > 0) {
        const ext = path.extname(thumbFile.name) || '.jpg';
        const fileName = `thumb_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        const buf = await thumbFile.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buf));
        finalThumbnail = `/uploads/${fileName}`;
      }

      const video = await prisma.traditionVideo.create({
        data: {
          videoUrl:  finalVideoUrl,
          title,
          thumbnail: finalThumbnail || null,
          link:      link || null,
        }
      });
      return NextResponse.json(video);

    } else {
      // ── URL-ONLY (JSON) ────────────────────────────────────────────────
      const data  = await req.json();
      const video = await prisma.traditionVideo.create({
        data: {
          videoUrl:  data.videoUrl,
          title:     data.title,
          thumbnail: data.thumbnail || null,
          link:      data.link || null,
        }
      });
      return NextResponse.json(video);
    }

  } catch (error) {
    console.error('[POST /api/videos]', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
