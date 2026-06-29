import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build a unique file path inside the bucket
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `cms_${Date.now()}.${ext}`;

    const buf = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buf, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('[POST /api/upload] Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get the permanent public URL
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicData.publicUrl });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
