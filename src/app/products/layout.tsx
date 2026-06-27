import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'Shop Premium Kitchenware, Cookware & Kitchen Accessories',
  description:
    'Browse KitchenBay\'s curated collection of premium handcrafted kitchenware, cast iron cookware, stainless steel utensils, brass & copper vessels, soapstone pots, and kitchen accessories. Shop online with free shipping above ₹2000.',
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: `Shop All Products — Premium Kitchenware & Cookware | ${SITE_NAME}`,
    description:
      'Explore our curated collection of handcrafted kitchenware — cast iron, brass, copper, soapstone cookware & more. Free shipping above ₹2000.',
    url: `${SITE_URL}/products`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} Products` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Shop Premium Kitchenware | ${SITE_NAME}`,
    description:
      'Browse handcrafted kitchenware, cookware & accessories. Cast iron, brass, copper & soapstone.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
