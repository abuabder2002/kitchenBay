// ============================================================
// KITCHENBAY — Central SEO Configuration
// ============================================================
// Single source of truth for all SEO metadata, structured data,
// and sitemap generation across the site.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenbay.co';

export const SITE_NAME = 'KitchenBay';
export const SITE_TAGLINE = 'The Home Needs';
export const SITE_LEGAL_NAME = 'Kitchenbay Private Limited';

export const SITE_DESCRIPTION =
  "India's premium destination for authentic handcrafted kitchenware, cookware, dining essentials, and traditional home décor. Shop stainless steel utensils, cast iron cookware, brass & copper vessels, and kitchen accessories online at KitchenBay.";

export const SITE_SHORT_DESCRIPTION =
  'Premium handcrafted kitchenware, cookware & home décor from India. Shop cast iron, brass, copper, soapstone cookware & kitchen accessories at KitchenBay.';

// ─── BUSINESS / NAP (Name, Address, Phone) ──────────────────
export const BUSINESS = {
  name: SITE_LEGAL_NAME,
  alternateName: SITE_NAME,
  email: 'kitchenbaypvtltd@gmail.com',
  phone: '+91-9876543210', // placeholder — replace with actual
  address: {
    streetAddress: '19/A, Line Street',
    addressLocality: 'Attur',
    addressRegion: 'Tamil Nadu',
    postalCode: '636102',
    addressCountry: 'IN',
  },
  geo: {
    latitude: 11.5962,
    longitude: 78.6025,
  },
  foundingDate: '2015',
  // GST placeholder — replace with actual GST number
  gstNumber: 'GST_PLACEHOLDER',
  priceRange: '₹₹',
  openingHours: 'Mo-Sa 09:00-18:00',
  areaServed: 'IN',
  currency: 'INR',
} as const;

// ─── SOCIAL PROFILES ────────────────────────────────────────
export const SOCIAL = {
  facebook: 'https://facebook.com/kitchenbay',
  instagram: 'https://instagram.com/kitchenbay',
  youtube: 'https://youtube.com/@kitchenbay',
  twitter: '', // add when available
} as const;

export const SOCIAL_URLS = Object.values(SOCIAL).filter(Boolean);

// ─── DEFAULT OG IMAGE ───────────────────────────────────────
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg`;

// ─── PRODUCT CATEGORIES (for sitemaps & schema) ─────────────
export const PRODUCT_CATEGORIES = [
  { id: 'kitchenware', name: 'Kitchenware', slug: 'kitchenware' },
  { id: 'dining', name: 'Dining', slug: 'dining' },
  { id: 'brass-copper', name: 'Brass & Copper', slug: 'brass-copper' },
  { id: 'decor', name: 'Décor', slug: 'decor' },
] as const;

// ─── TARGET KEYWORDS (for reference, not stuffing) ──────────
export const TARGET_KEYWORDS = [
  'kitchenware',
  'cookware',
  'stainless steel utensils',
  'kitchen accessories',
  'kitchen storage',
  'home kitchen products',
  'kitchen essentials',
  'KitchenBay',
  'Indian kitchenware',
  'premium kitchen products',
  'Tamil Nadu kitchenware',
  'kitchen shopping online',
  'cast iron cookware',
  'brass cookware',
  'copper cookware',
  'soapstone cookware',
  'handcrafted kitchenware',
] as const;

// ─── ANALYTICS PLACEHOLDERS ─────────────────────────────────
export const ANALYTICS = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || '',
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  pinterestTag: process.env.NEXT_PUBLIC_PINTEREST_TAG || '',
} as const;

// ─── VERIFICATION CODES ─────────────────────────────────────
export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION || '',
} as const;
