import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';
import prisma from '@/lib/prisma';

/**
 * Dynamic metadata for individual product pages.
 * Title pattern: "{Product Name} | Premium Kitchenware | KitchenBay"
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        image: true,
        category: true,
        material: true,
        brand: true,
        price: true,
      },
    });

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for could not be found.',
        robots: { index: false, follow: true },
      };
    }

    const title = `${product.name} | Premium ${product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Kitchenware'} | ${SITE_NAME}`;
    const description = product.description
      ? product.description.slice(0, 155) + (product.description.length > 155 ? '...' : '')
      : `Shop ${product.name} at ${SITE_NAME}. Premium handcrafted ${product.material || 'kitchenware'} delivered across India.`;

    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : product.image
        ? `${SITE_URL}${product.image}`
        : DEFAULT_OG_IMAGE;

    const productUrl = `${SITE_URL}/products/${id}`;

    return {
      title,
      description,
      alternates: { canonical: productUrl },
      openGraph: {
        title,
        description,
        url: productUrl,
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | ${SITE_NAME}`,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error('[product/layout] Error generating metadata:', error);
    return {
      title: `Product | ${SITE_NAME}`,
      description: `Shop premium handcrafted kitchenware at ${SITE_NAME}.`,
    };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
