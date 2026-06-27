import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Gift Concierge — Premium Kitchen Gift Ideas & Curated Sets',
  description:
    'Discover the perfect kitchen gift with KitchenBay\'s Gift Concierge. Curated gift sets for weddings, housewarmings, festivals & corporate gifting. Premium handcrafted kitchenware that makes a lasting impression.',
  alternates: { canonical: `${SITE_URL}/gift-concierge` },
  openGraph: {
    title: `Gift Concierge — Curated Kitchen Gifts | ${SITE_NAME}`,
    description: 'Premium kitchen gift sets for weddings, housewarmings & festivals.',
    url: `${SITE_URL}/gift-concierge`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Gifts` }],
  },
};

export default function GiftLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
