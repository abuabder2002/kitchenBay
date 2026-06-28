import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'About Us — Our Story, Mission & Artisan Heritage',
  description:
    'Learn about KitchenBay — India\'s premium destination for handcrafted kitchenware. Discover our mission to empower 50+ artisans, our founding story from Attur, Tamil Nadu, and our commitment to authentic craftsmanship.',
  alternates: { canonical: `${SITE_URL}/about-us` },
  openGraph: {
    title: `About ${SITE_NAME} — Our Heritage & Artisan Story`,
    description:
      'From a family-run retail legacy to India\'s premium online kitchenware brand. Learn how KitchenBay empowers artisans across 28 states.',
    url: `${SITE_URL}/about-us`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `About ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${SITE_NAME} — Our Heritage & Artisan Story`,
    description:
      'From a family-run retail legacy to India\'s premium online kitchenware brand.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
