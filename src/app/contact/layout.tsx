import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Contact Us — Get In Touch with KitchenBay',
  description:
    'Have questions about our handcrafted kitchenware? Contact KitchenBay at kitchenbaypvtltd@gmail.com or visit us at 19/A, Line Street, Attur, Salem, Tamil Nadu 636102. We\'re here to help!',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `Contact ${SITE_NAME} — Customer Support & Inquiries`,
    description:
      'Reach out to KitchenBay for product inquiries, bulk orders, returns, or any questions. Email: kitchenbaypvtltd@gmail.com | Located in Attur, Tamil Nadu.',
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `Contact ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary',
    title: `Contact ${SITE_NAME} — Customer Support`,
    description:
      'Get in touch with KitchenBay for product inquiries, bulk orders, and support.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
