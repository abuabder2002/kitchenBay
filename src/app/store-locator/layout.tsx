import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Find a Store — KitchenBay Store Locator',
  description:
    'Find KitchenBay stores near you. Visit our retail location at 19/A, Line Street, Attur, Salem, Tamil Nadu 636102. Experience our premium kitchenware in person.',
  alternates: { canonical: `${SITE_URL}/store-locator` },
  openGraph: {
    title: `Store Locator | ${SITE_NAME}`,
    description: 'Find a KitchenBay store near you in Attur, Salem, Tamil Nadu.',
    url: `${SITE_URL}/store-locator`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Store` }],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
