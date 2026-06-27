import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Sitemap — Complete Site Directory',
  description:
    'Browse the complete directory of all pages on KitchenBay. Find products, categories, company info, help resources, and legal pages.',
  alternates: { canonical: `${SITE_URL}/sitemap` },
  openGraph: {
    title: `Sitemap | ${SITE_NAME}`,
    description: 'A complete directory of all pages on KitchenBay.',
    url: `${SITE_URL}/sitemap`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Sitemap` }],
  },
};

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
