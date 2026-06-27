import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions About KitchenBay',
  description:
    'Find answers to common questions about KitchenBay orders, shipping, returns, payments, and product quality. Get help with your handcrafted kitchenware purchases.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: `FAQ — Frequently Asked Questions | ${SITE_NAME}`,
    description:
      'Everything you need to know about shopping with KitchenBay — shipping, returns, payments, and product care.',
    url: `${SITE_URL}/faq`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} FAQ` }],
  },
  twitter: {
    card: 'summary',
    title: `FAQ | ${SITE_NAME}`,
    description: 'Answers to common questions about KitchenBay orders, shipping, returns & more.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
