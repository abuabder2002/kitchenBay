'use client';

import Link from 'next/link';
import { Apple, Play } from 'lucide-react';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/kitchenbay',
    svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/kitchenbay',
    svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeWidth="1.5" strokeLinecap="round" /></>,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@kitchenbay',
    svg: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" strokeWidth="1.5" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  },
];

// Explicit correct paths — no slug-generation guessing
const companyLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Store Locator', href: '/store-locator' },
  { label: 'Our Story', href: '/story' },
];

const helpLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Track Order', href: '/track' },  // page is at /track
  { label: 'Returns & Refunds', href: '/returns-refunds' },
  { label: 'Contact Us', href: '/contact' },  // page is at /contact
];

const policyLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
];

const shopLinks = [
  { label: 'All Products', href: '/products' },
  { label: 'Kitchenware', href: '/products?cat=Kitchenware' },
  { label: 'Dining', href: '/products?cat=Dining' },
  { label: 'Décor', href: '/products?cat=Décor' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'My Orders', href: '/orders' },
];

export default function Footer() {
  return (
    <footer className="w-full flex flex-col border-t-4 border-blue-500">

      {/* ── TOP FOOTER ────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white py-14">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">

            {/* Brand – spans 2 cols on large screens */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Link href="/" className="inline-block">
                <h2 className="text-3xl md:text-4xl font-black tracking-wider text-white font-[family-name:var(--font-heading)] mb-1">
                  KITCHENBAY
                </h2>
                <p className="text-sm md:text-base font-light italic tracking-[0.15em] text-white/90 mb-3">
                  The Home Needs
                </p>
              </Link>
              <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                India&apos;s Premium Destination for Authentic Handcrafted Kitchenware,
                Dining &amp; Traditional Home Décor
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3 mt-1">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white hover:border-white hover:text-blue-600 transition-all duration-200 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                      {item.svg}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-5 uppercase text-xs tracking-widest text-white/60">Company</h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {companyLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-bold mb-5 uppercase text-xs tracking-widest text-white/60">Shop</h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {shopLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-bold mb-5 uppercase text-xs tracking-widest text-white/60">Help</h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {helpLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h4 className="font-bold mt-7 mb-5 uppercase text-xs tracking-widest text-white/60">Policies</h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {policyLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get the App */}
            <div>
              <h4 className="font-bold mb-5 uppercase text-xs tracking-widest text-white/60">Get the App</h4>
              <p className="text-sm text-white/80 mb-5 leading-relaxed">
                Download our app for exclusive deals &amp; early access
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-blue-700 hover:bg-white hover:text-blue-700 text-white border border-white/20 hover:border-white rounded-lg py-2.5 px-4 transition-all duration-200 group shadow-sm"
                >
                  <Apple size={18} className="shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-70 group-hover:opacity-100 leading-none">Download on the</p>
                    <p className="text-sm font-bold leading-tight">App Store</p>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-blue-700 hover:bg-white hover:text-blue-700 text-white border border-white/20 hover:border-white rounded-lg py-2.5 px-4 transition-all duration-200 group shadow-sm"
                >
                  <Play size={18} className="shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-70 group-hover:opacity-100 leading-none">Get it on</p>
                    <p className="text-sm font-bold leading-tight">Play Store</p>
                  </div>
                </a>
              </div>

              {/* Newsletter */}
              <div className="mt-7">
                <h4 className="font-bold mb-3 uppercase text-xs tracking-widest text-white/60">Newsletter</h4>
                <form
                  onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    aria-label="Email address for newsletter"
                    className="flex-1 rounded-lg bg-blue-700/50 border border-white/20 text-white placeholder:text-white/40 text-xs px-3 py-2.5 outline-none focus:border-white transition-colors min-w-0 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-lg px-4 py-2.5 transition-colors shrink-0 shadow-sm"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── BOTTOM FOOTER ─────────────────────────────────────────────── */}
      <div className="bg-blue-700 py-4 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-sm font-medium">
            &copy; 2015 KitchenBay. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'NetBanking'].map((method) => (
              <span
                key={method}
                className="bg-blue-500 text-white border border-white/20 shadow-sm text-xs px-3 py-1 rounded-full font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
