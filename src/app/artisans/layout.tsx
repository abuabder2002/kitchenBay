import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Our Artisans — Meet the Master Craftspeople Behind KitchenBay',
  description:
    'Meet the skilled artisans and craftspeople behind every KitchenBay product. From cast iron forgers to brass smiths — learn about the hands that shape your kitchen.',
  alternates: { canonical: `${SITE_URL}/artisans` },
  openGraph: {
    title: `Our Artisans | ${SITE_NAME}`,
    description: 'Meet the master craftspeople behind KitchenBay\'s handcrafted kitchenware.',
    url: `${SITE_URL}/artisans`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Artisans` }],
  },
};

export default function ArtisansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
