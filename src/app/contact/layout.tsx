import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Contact Us — KitchenBay Salem & Chennai',
  description:
    'Have questions about our handcrafted kitchenware? Contact KitchenBay at kitchenbaypvtltd@gmail.com, visit our Salem store (19/A, Line Street, Attur, Salem, Tamil Nadu 636102) or Chennai store (No 457, Vardharajapuram MTH Road Ambattur Chennai 600053). We deliver to Madurai, Vellore, Trichy and across Tamil Nadu.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `Contact ${SITE_NAME} — Customer Support & Inquiries`,
    description:
      'Reach out to KitchenBay for product inquiries, bulk orders, returns, or any questions. Stores in Salem and Chennai, Tamil Nadu — delivering to Madurai, Vellore, and Trichy.',
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
