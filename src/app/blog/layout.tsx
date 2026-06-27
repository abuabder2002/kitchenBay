import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Blog — Kitchen Tips, Recipes & Artisan Stories',
  description:
    'Read the KitchenBay Journal for expert kitchen tips, traditional recipes, cookware care guides, artisan stories, and Ayurvedic cooking wisdom. Your guide to better cooking.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `The ${SITE_NAME} Journal — Kitchen Tips & Stories`,
    description: 'Expert kitchen tips, recipes, care guides & artisan stories from KitchenBay.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Blog` }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
