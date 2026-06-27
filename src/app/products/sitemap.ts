import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seoConfig';
import prisma from '@/lib/prisma';

/**
 * Dynamic product sitemap — fetches all active products from the database.
 * Includes product images for Google Image sitemap support.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
        image: true,
        name: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return products.map((product) => {
      const images: string[] = [];
      if (product.image) {
        // If image is a full URL, use it directly; otherwise prepend site URL
        const imgUrl = product.image.startsWith('http')
          ? product.image
          : `${SITE_URL}${product.image}`;
        images.push(imgUrl);
      }

      return {
        url: `${SITE_URL}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        ...(images.length > 0 ? { images } : {}),
      };
    });
  } catch (error) {
    // If DB is unavailable, return empty sitemap rather than crashing
    console.error('[products/sitemap] Error fetching products:', error);
    return [];
  }
}
