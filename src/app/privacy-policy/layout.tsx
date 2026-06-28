import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy — Your Data Protection Rights',
  description:
    'Read KitchenBay\'s privacy policy. Learn how we collect, use, and protect your personal data when you shop with us. Your privacy matters.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How KitchenBay protects your personal data and privacy.',
    url: `${SITE_URL}/privacy-policy`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Privacy Policy` }],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
