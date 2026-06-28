import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbSchema } from '@/lib/schemas';
import { SITE_URL } from '@/lib/seoConfig';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Semantic breadcrumb navigation with BreadcrumbList JSON-LD schema.
 * Follows Schema.org BreadcrumbList specification.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { name: 'Home', href: '/' },
 *     { name: 'Products', href: '/products' },
 *     { name: 'Cast Iron Appakal', href: '/products/ci-001' },
 *   ]} />
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = items.map((item) => ({
    name: item.name,
    url: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
  }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(schemaItems)} />
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[--color-brand-border] bg-white"
      >
        <ol className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-xs uppercase tracking-widest text-[--color-brand-muted] list-none m-0 p-0 flex-wrap">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {idx > 0 && (
                  <span aria-hidden="true" className="text-[--color-brand-border]">
                    /
                  </span>
                )}
                {isLast ? (
                  <span
                    className="text-[--color-brand-text] font-bold line-clamp-1"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[--color-brand-text] transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
