import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Our Story — The KitchenBay Journey from Tradition to Modern Homes',
  description:
    'Discover how KitchenBay was born from a passion for India\'s artisan heritage. From handcrafted cookware traditions of Tamil Nadu to delivering premium kitchenware across the nation.',
  alternates: { canonical: `${SITE_URL}/story` },
  openGraph: {
    title: `Our Story | ${SITE_NAME}`,
    description: 'The journey from traditional artisan clusters to India\'s premium online kitchenware destination.',
    url: `${SITE_URL}/story`,
    type: 'article',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Story` }],
  },
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
