import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key (bypasses RLS) for server-side admin uploads.
// Falls back to publishable key if service role is not set.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const BUCKET = 'cms-images';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.mp4';
    const fileName = `cms_${Date.now()}${ext}`;
    const buf = await file.arrayBuffer();

    // 1. Try Supabase Storage if configured
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const contentType = file.type || (
          ext.match(/\.(mp4|webm|mov|m4v|avi|ogv)$/i) ? `video/${ext.replace('.', '').toLowerCase()}` : 'application/octet-stream'
        );

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, buf, {
            contentType,
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            return NextResponse.json({ success: true, url: publicData.publicUrl });
          }
        } else {
          console.warn('[POST /api/upload] Supabase upload error, attempting local storage fallback:', uploadError);
        }
      } catch (sbErr) {
        console.warn('[POST /api/upload] Supabase upload failed, attempting local storage fallback:', sbErr);
      }
    }

    // 2. Local disk fallback (/public/uploads)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, Buffer.from(buf));

      return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
    } catch (localErr: any) {
      console.error('[POST /api/upload] Local storage fallback error:', localErr);
      return NextResponse.json(
        { error: `Upload failed: ${localErr?.message || 'Storage error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload file' }, { status: 500 });
  }
}

