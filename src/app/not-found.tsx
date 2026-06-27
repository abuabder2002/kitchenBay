import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found — KitchenBay',
  description:
    'The page you are looking for does not exist or has been moved. Browse our premium kitchenware, cookware, and home décor collections instead.',
  robots: { index: false, follow: true },
};

const popularCategories = [
  { name: 'Kitchenware', href: '/products?category=kitchenware' },
  { name: 'Dining', href: '/products?category=dining' },
  { name: 'Brass & Copper', href: '/products?category=brass-copper' },
  { name: 'Décor', href: '/products?category=decor' },
  { name: 'All Products', href: '/products' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-xl mx-auto text-center">
          {/* 404 Number */}
          <p className="text-[120px] sm:text-[160px] font-black text-[--color-brand-border] leading-none select-none font-[family-name:var(--font-heading)]">
            404
          </p>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] -mt-6 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-[--color-brand-muted] text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved. Let&apos;s get you back on track.
          </p>

          {/* Search */}
          <form
            action="/products"
            method="GET"
            className="flex items-center max-w-sm mx-auto mb-10 border border-[--color-brand-border] rounded-sm overflow-hidden bg-white shadow-sm"
          >
            <input
              type="text"
              name="search"
              placeholder="Search for products..."
              className="flex-1 px-4 py-3 text-sm text-[--color-brand-text] outline-none bg-transparent"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-[--color-brand-text] text-white hover:bg-[--color-brand-accent] transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Category Links */}
          <div className="mb-10">
            <p className="text-xs font-bold text-[--color-brand-muted] uppercase tracking-widest mb-4">
              Popular Categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="px-4 py-2 border border-[--color-brand-border] text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-text] hover:text-white transition-colors rounded-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-[--color-brand-text] text-white font-bold uppercase tracking-widest text-sm hover:bg-[--color-brand-accent] transition-colors rounded-sm"
            >
              <Home size={16} />
              Go Home
            </Link>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.history.back();
              }}
              className="flex items-center gap-2 px-6 py-3 border border-[--color-brand-text] text-[--color-brand-text] font-bold uppercase tracking-widest text-sm hover:bg-[--color-brand-text] hover:text-white transition-colors rounded-sm"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
