import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cms_images');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const fileName = `cms_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    const buf = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buf));
    
    const fileUrl = `/uploads/cms_images/${fileName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
