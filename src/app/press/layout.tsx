import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Press & Media — KitchenBay in the News',
  description:
    'Read about KitchenBay in the media. Press releases, news coverage, and brand stories about India\'s premium handcrafted kitchenware destination.',
  alternates: { canonical: `${SITE_URL}/press` },
  openGraph: {
    title: `Press & Media | ${SITE_NAME}`,
    description: 'KitchenBay in the news — press releases and media coverage.',
    url: `${SITE_URL}/press`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Press` }],
  },
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
