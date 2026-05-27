import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';

// Limit concurrent image downloads to 5 to avoid overloading/timeouts
const limit = pLimit(5);

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// Helper to ensure target directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Downloads a single image URL and saves it to public/images/products.
 * Returns the public path (e.g. /images/products/filename.ext) or fallback.
 */
export async function downloadImage(url: string, prefix: string): Promise<string> {
  return limit(async () => {
    const fallbackPath = '/images/products/cast_iron_skillet.png';
    if (!url || typeof url !== 'string') {
      return fallbackPath;
    }

    try {
      ensureUploadDir();

      // Clean prefix for filename
      const cleanPrefix = prefix
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase()
        .substring(0, 30);

      // Perform request to fetch image
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch image from ${url}: Status ${response.status}`);
        return fallbackPath;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.warn(`URL is not an image: ${url} (Content-Type: ${contentType})`);
        return fallbackPath;
      }

      // Determine file extension
      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('gif')) ext = 'gif';
      else if (contentType.includes('svg')) ext = 'svg';

      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `${cleanPrefix}_${Date.now()}.${ext}`;
      const destPath = path.join(UPLOAD_DIR, filename);

      fs.writeFileSync(destPath, buffer);
      return `/images/products/${filename}`;
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error);
      return fallbackPath;
    }
  });
}
