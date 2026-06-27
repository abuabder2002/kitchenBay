import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Cookie Policy — How We Use Cookies',
  description:
    'Understand how KitchenBay uses cookies to improve your browsing experience, analyze site traffic, and personalize content.',
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  openGraph: {
    title: `Cookie Policy | ${SITE_NAME}`,
    description: 'Learn about cookies used on the KitchenBay website.',
    url: `${SITE_URL}/cookie-policy`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Cookie Policy` }],
  },
};

export default function CookieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
