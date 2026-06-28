// ============================================================
// KITCHENBAY — Schema.org JSON-LD Generator Functions
// ============================================================
// Generates valid Schema.org structured data objects for use
// with the JsonLd component across the site.

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  BUSINESS,
  SOCIAL_URLS,
} from './seoConfig';

// ─── Organization ───────────────────────────────────────────
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    sameAs: SOCIAL_URLS,
    address: postalAddressSchema(),
    contactPoint: contactPointSchema(),
    foundingDate: BUSINESS.foundingDate,
  };
}

// ─── LocalBusiness ──────────────────────────────────────────
export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: SITE_URL,
    image: `${SITE_URL}/favicon.ico`,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    priceRange: BUSINESS.priceRange,
    openingHours: BUSINESS.openingHours,
    address: postalAddressSchema(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    sameAs: SOCIAL_URLS,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

// ─── WebSite + SearchAction ─────────────────────────────────
export function websiteSchema() {
  return {
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
}

// ─── WebPage ────────────────────────────────────────────────
export function webPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };
}

// ─── CollectionPage ─────────────────────────────────────────
export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

// ─── BreadcrumbList ─────────────────────────────────────────
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Product ────────────────────────────────────────────────
export function productSchema(product: {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  category?: string;
  material?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  discount?: number;
  gstPercent?: number;
  sku?: string;
  weight?: number;
  subImages?: string[];
}) {
  const url = `${SITE_URL}/products/${product.id}`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image}`;
  const additionalImages = (product.subImages || [])
    .filter(Boolean)
    .map((img) => (img.startsWith('http') ? img : `${SITE_URL}${img}`));
  const allImages = [imageUrl, ...additionalImages];

  const inStock = (product.stock ?? 0) > 0;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: allImages,
    url,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    category: product.category,
    material: product.material,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency || 'INR',
      price: product.price,
      ...(product.originalPrice && product.originalPrice > product.price
        ? {
            priceValidUntil: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString().split('T')[0],
          }
        : {}),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      shippingDetails: shippingDetailsSchema(),
      hasMerchantReturnPolicy: merchantReturnPolicySchema(),
    },
  };

  // Aggregate Rating
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: product.reviewCount,
    };
  }

  // Weight
  if (product.weight) {
    schema.weight = {
      '@type': 'QuantitativeValue',
      value: product.weight,
      unitCode: Number(product.weight) < 10 ? 'KGM' : 'GRM',
    };
  }

  return schema;
}

// ─── ShippingDetails ────────────────────────────────────────
export function shippingDetailsSchema() {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: 0,
      currency: 'INR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 3,
        maxValue: 7,
        unitCode: 'DAY',
      },
    },
  };
}

// ─── MerchantReturnPolicy ───────────────────────────────────
export function merchantReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'IN',
    returnPolicyCategory:
      'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 2,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  };
}

// ─── FAQPage ────────────────────────────────────────────────
export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── ItemList ───────────────────────────────────────────────
export function itemListSchema(
  items: Array<{ name: string; url: string; position: number }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

// ─── PostalAddress (internal helper) ────────────────────────
function postalAddressSchema() {
  return {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.address.streetAddress,
    addressLocality: BUSINESS.address.addressLocality,
    addressRegion: BUSINESS.address.addressRegion,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.addressCountry,
  };
}

// ─── ContactPoint (internal helper) ─────────────────────────
function contactPointSchema() {
  return {
    '@type': 'ContactPoint',
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    contactType: 'customer service',
    areaServed: BUSINESS.areaServed,
    availableLanguage: ['English', 'Tamil', 'Hindi'],
  };
}
