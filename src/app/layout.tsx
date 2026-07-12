import type { Metadata } from 'next';
import { Playfair_Display, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';
import { WishlistProvider } from '@/lib/wishlistContext';
import { ProductsProvider } from '@/lib/productsContext';
import { AuthProvider } from '@/lib/authContext';
import { OrdersProvider } from '@/lib/ordersContext';
import { NextAuthProvider } from '@/components/Providers';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/CartDrawer'));
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  VERIFICATION,
  BUSINESS,
  SOCIAL_URLS,
  TARGET_KEYWORDS,
} from '@/lib/seoConfig';
import { localBusinessSchemas } from '@/lib/schemas';
import AnalyticsScripts from '@/components/seo/AnalyticsScripts';

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// ── Root Metadata ───────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Handcrafted Kitchenware, Cookware & Home Décor | India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...TARGET_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Canonical & Alternates ──────────────────────────────
  alternates: {
    canonical: '/',
  },

  // ── Robots ──────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // ── Open Graph ──────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Handcrafted Kitchenware & Home Décor`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Premium Handcrafted Kitchenware`,
        type: 'image/jpeg',
      },
    ],
  },

  // ── Twitter Card ────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Premium Handcrafted Kitchenware & Home Décor`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: '@kitchenbay',
  },

  // ── Verification ────────────────────────────────────────
  verification: {
    google: VERIFICATION.google || undefined,
    other: {
      ...(VERIFICATION.bing ? { 'msvalidate.01': VERIFICATION.bing } : {}),
      ...(VERIFICATION.pinterest
        ? { 'p:domain_verify': VERIFICATION.pinterest }
        : {}),
    },
  },

  // ── Category / Classification ───────────────────────────
  category: 'E-Commerce',
};

// ── Organization + WebSite + SearchAction JSON-LD ──────────
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BUSINESS.name,
  alternateName: BUSINESS.alternateName,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.jpeg`,
  email: BUSINESS.email,
  telephone: BUSINESS.phone,
  sameAs: SOCIAL_URLS,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.address.streetAddress,
    addressLocality: BUSINESS.address.addressLocality,
    addressRegion: BUSINESS.address.addressRegion,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.addressCountry,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    contactType: 'customer service',
    areaServed: BUSINESS.areaServed,
    availableLanguage: ['English', 'Tamil', 'Hindi'],
  },
  foundingDate: BUSINESS.foundingDate,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeSchemas = localBusinessSchemas();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {/* WebSite + SearchAction Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {/* LocalBusiness Schema — one per physical store (Salem, Chennai) */}
        {storeSchemas.map((schema) => (
          <script
            key={schema['@id']}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
            }}
          />
        ))}
        {/* Geo metadata for local SEO */}
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Salem, Chennai, Madurai, Vellore, Trichy, Tamil Nadu" />
        <meta
          name="geo.position"
          content={`${BUSINESS.geo.latitude};${BUSINESS.geo.longitude}`}
        />
        <meta
          name="ICBM"
          content={`${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`}
        />
      </head>
      <body className={`${playfair.variable} ${nunitoSans.variable} font-[family-name:var(--font-body)] bg-[--color-brand-bg] text-[--color-brand-text] antialiased selection:bg-[--color-brand-accent] selection:text-white`}>
        <NextAuthProvider>
          <AuthProvider>
            <ProductsProvider>
              <WishlistProvider>
                <CartProvider>
                  <OrdersProvider>{children}</OrdersProvider>
                  <CartDrawer />
                </CartProvider>
              </WishlistProvider>
            </ProductsProvider>
          </AuthProvider>
        </NextAuthProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
