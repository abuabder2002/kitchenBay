import { createClient as createSupabaseClient } from '@/utils/supabase/client';

/**
 * Uploads a media file (image or video) to Supabase Storage directly from the client.
 * Falls back to /api/upload if client-side upload fails or Supabase is unconfigured.
 * Throws an explicit error if upload fails — NEVER falls back to base64 Data URL for videos
 * as large base64 video payloads exceed API body limits and crash product saves.
 */
export async function uploadMediaFile(file: File): Promise<string> {
  const MAX_SIZE_MB = 50;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size exceeds maximum allowed limit (${MAX_SIZE_MB} MB). Please choose a smaller file.`);
  }

  const ext = file.name.substring(file.name.lastIndexOf('.')) || (file.type.startsWith('video/') ? '.mp4' : '.jpg');
  const cleanExt = ext.toLowerCase();
  const fileName = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${cleanExt}`;
  const contentType = file.type || (cleanExt === '.mp4' ? 'video/mp4' : 'application/octet-stream');

  // 1. Try direct browser-to-Supabase Storage upload (bypasses serverless body limit)
  try {
    const supabase = createSupabaseClient();
    const { data: uploadData, error: sbError } = await supabase.storage
      .from('cms-images')
      .upload(fileName, file, { contentType, upsert: false });

    if (!sbError && uploadData) {
      const { data: publicData } = supabase.storage.from('cms-images').getPublicUrl(fileName);
      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }
    } else if (sbError) {
      console.warn('[uploadMediaFile] Direct Supabase upload warning:', sbError.message);
    }
  } catch (sbErr) {
    console.warn('[uploadMediaFile] Direct Supabase client error:', sbErr);
  }

  // 2. Fallback to /api/upload Route Handler
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('File size exceeds server upload limit (4.5 MB). Please compress the video or upload a smaller file.');
    }
    throw new Error(data.error || `Upload server error (${res.status})`);
  }

  if (data.url) {
    return data.url;
  }

  throw new Error('Upload server did not return a valid media URL.');
}
