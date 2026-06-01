/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.traditionVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }          = await params;
    const contentType     = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // ── FILE UPLOAD (FormData) ───────────────────────────────────────
      const formData  = await req.formData();
      const title     = formData.get('title') as string;
      const link      = formData.get('link') as string | null;
      const videoFile = formData.get('videoFile') as File | null;
      const thumbFile = formData.get('thumbnailFile') as File | null;
      const videoUrl  = formData.get('videoUrl') as string | null;
      const thumbnail = formData.get('thumbnail') as string | null;

      // Fetch the existing record so unchanged fields aren't lost
      const existing = await prisma.traditionVideo.findUniqueOrThrow({ where: { id } });

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

      let finalVideoUrl  = videoUrl  || existing.videoUrl;
      let finalThumbnail = thumbnail || existing.thumbnail || '';

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

      const video = await prisma.traditionVideo.update({
        where: { id },
        data: {
          videoUrl:  finalVideoUrl,
          title,
          thumbnail: finalThumbnail || null,
          link:      link || null,
        }
      });
      return NextResponse.json(video);

    } else {
      // ── URL-ONLY (JSON) ──────────────────────────────────────────────
      const data  = await req.json();
      const video = await prisma.traditionVideo.update({
        where: { id },
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
    console.error('[PUT /api/videos/:id]', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}
