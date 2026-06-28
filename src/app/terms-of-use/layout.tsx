import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Terms of Use — Terms & Conditions',
  description:
    'Read KitchenBay\'s terms of use and conditions for shopping, account registration, and using our website. Understand your rights and responsibilities.',
  alternates: { canonical: `${SITE_URL}/terms-of-use` },
  openGraph: {
    title: `Terms of Use | ${SITE_NAME}`,
    description: 'Terms and conditions for using the KitchenBay website and shopping.',
    url: `${SITE_URL}/terms-of-use`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Terms` }],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
