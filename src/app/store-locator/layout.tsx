import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Find a Store in Salem & Chennai — KitchenBay Store Locator',
  description:
    'Find KitchenBay stores near you. Visit our retail locations at 19/A, Line Street, Attur, Salem, Tamil Nadu 636102, or KitchenBay Craft Cluster, Chennai, Tamil Nadu 600001. We also deliver premium kitchenware to Madurai, Vellore, Tiruchirappalli (Trichy) and across Tamil Nadu.',
  keywords: [
    'kitchenware store Salem',
    'kitchenware store Chennai',
    'kitchenware shop near me',
    'cookware store Tamil Nadu',
    'KitchenBay store locator',
    'kitchen accessories store Madurai',
    'kitchen accessories store Vellore',
    'kitchen accessories store Trichy',
  ],
  alternates: { canonical: `${SITE_URL}/store-locator` },
  openGraph: {
    title: `Store Locator | ${SITE_NAME}`,
    description: 'Find a KitchenBay store near you in Salem or Chennai, Tamil Nadu. We deliver to Madurai, Vellore, Trichy and beyond.',
    url: `${SITE_URL}/store-locator`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Store` }],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
