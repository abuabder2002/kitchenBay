import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Returns & Refunds — Easy 48-Hour Return Policy',
  description:
    'KitchenBay offers a hassle-free 48-hour return policy. Learn about our return process, refund timelines, and exchange options for kitchenware products.',
  alternates: { canonical: `${SITE_URL}/returns-refunds` },
  openGraph: {
    title: `Returns & Refunds Policy | ${SITE_NAME}`,
    description: '48-hour easy return policy. Hassle-free refunds and exchanges.',
    url: `${SITE_URL}/returns-refunds`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Returns` }],
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
