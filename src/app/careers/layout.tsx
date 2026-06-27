import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Careers — Join the KitchenBay Team',
  description:
    'Explore career opportunities at KitchenBay. Join our team in Attur, Tamil Nadu, and help us bring India\'s finest handcrafted kitchenware to homes across the nation.',
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: {
    title: `Careers at ${SITE_NAME}`,
    description: 'Join our mission to bring authentic Indian kitchenware to the world.',
    url: `${SITE_URL}/careers`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `Careers at ${SITE_NAME}` }],
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
