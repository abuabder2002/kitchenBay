// ============================================================
// KITCHENBAY — Central SEO Configuration
// ============================================================
// Single source of truth for all SEO metadata, structured data,
// and sitemap generation across the site.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenbay.co';

export const SITE_NAME = 'KitchenBay';
export const SITE_TAGLINE = 'The Home Needs';
export const SITE_LEGAL_NAME = 'Kitchenbay The Home Needs (salem)';

export const SITE_DESCRIPTION =
  "India's premium destination for authentic handcrafted kitchenware, cookware, dining essentials, and traditional home décor. Shop stainless steel utensils, cast iron cookware, brass & copper vessels, and kitchen accessories online at KitchenBay.";

export const SITE_SHORT_DESCRIPTION =
  'Premium handcrafted kitchenware, cookware & home décor from India. Shop cast iron, brass, copper, soapstone cookware & kitchen accessories at KitchenBay.';

// ─── BUSINESS / NAP (Name, Address, Phone) ──────────────────
// Primary/registered location (Salem). Used as the default for
// Organization schema and site-wide contact info.
export const BUSINESS = {
  name: SITE_LEGAL_NAME,
  alternateName: SITE_NAME,
  email: 'kitchenbaypvtltd@gmail.com',
  phone: '+91 7502777766', // placeholder — replace with actual
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

// ─── STORE LOCATIONS (for LocalBusiness schema, one per branch) ─
export const STORES = [
  {
    key: 'salem',
    name: 'Kitchenbay The Home Needs (Salem)',
    address: {
      streetAddress: '19/A, Line Street',
      addressLocality: 'Attur',
      addressRegion: 'Tamil Nadu',
      postalCode: '636102',
      addressCountry: 'IN',
    },
    geo: { latitude: 11.5962, longitude: 78.6025 },
    phone: '+91 7502777766',
  },
  {
    key: 'chennai',
    name: 'Kitchenbay The Homeneeds (Chennai)',
    address: {
      streetAddress: 'KitchenBay Craft Cluster',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600001',
      addressCountry: 'IN',
    },
    geo: { latitude: 13.0827, longitude: 80.2707 },
    phone: '+91 7010189976',
  },
] as const;

// ─── SERVICE AREAS (cities we deliver to, for local SEO copy) ──
// KitchenBay has physical stores only in Salem and Chennai (see
// STORES above). These are delivery/service-area cities, not
// branch locations — used for areaServed schema + on-page copy,
// never as fake LocalBusiness listings.
export const SERVICE_AREAS = [
  'Chennai',
  'Salem',
  'Madurai',
  'Vellore',
  'Tiruchirappalli (Trichy)',
  'Coimbatore',
] as const;

// ─── SOCIAL PROFILES ────────────────────────────────────────
export const SOCIAL = {
  facebook: 'https://facebook.com/kitchenbay',
  instagram: 'https://instagram.com/kitchenbay',
  youtube: 'https://youtube.com/@kitchenbay',
  twitter: '', // add when available
} as const;

export const SOCIAL_URLS = Object.values(SOCIAL).filter(Boolean);

// ─── DEFAULT OG IMAGE ───────────────────────────────────────
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.jpeg`;

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
  // Local / city-targeted (Chennai, Salem, Madurai, Vellore, Trichy)
  'kitchenware shop in Chennai',
  'kitchenware store in Salem',
  'cookware shop in Madurai',
  'kitchen accessories Vellore',
  'kitchenware store in Trichy',
  'buy cookware online Tamil Nadu',
  'kitchen items near me Tamil Nadu',
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
