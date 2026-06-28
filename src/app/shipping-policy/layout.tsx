import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Shipping Policy — Delivery Information & Charges',
  description:
    'Learn about KitchenBay\'s shipping policy. Free delivery above ₹2000, pan-India shipping to 20,000+ pincodes, 5-7 business days delivery. Cash on delivery available.',
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
  openGraph: {
    title: `Shipping Policy | ${SITE_NAME}`,
    description: 'Free shipping above ₹2000. Pan-India delivery in 5-7 business days.',
    url: `${SITE_URL}/shipping-policy`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Shipping` }],
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
