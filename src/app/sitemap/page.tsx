'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SitemapPage() {
  const sections = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/products' },
        { label: 'Kitchenware', href: '/products?category=kitchenware' },
        { label: 'Dining', href: '/products?category=dining' },
        { label: 'Décor', href: '/products?category=decor' },
        { label: 'Collections', href: '/collections' },
      ]
    },
    {
      title: 'My Account',
      links: [
        { label: 'My Profile', href: '/profile' },
        { label: 'My Orders', href: '/orders' },
        { label: 'Wishlist', href: '/wishlist' },
        { label: 'Cart', href: '/cart' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Our Story', href: '/story' },
        { label: 'Kitchenbays', href: '/Kitchenbays' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press & Media', href: '/press' },
        { label: 'Find a Store', href: '/store-locator' },
      ]
    },
    {
      title: 'Help & Support',
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Track Order', href: '/orders' },
        { label: 'Returns & Refunds', href: '/returns-refunds' },
        { label: 'Contact Us', href: '/contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Use', href: '/terms-of-use' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'GST Invoice', href: '/gst-invoice' },
      ]
    },
    {
      title: 'Account Access',
      links: [
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/signup' },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Sitemap</h1>
            <p className="text-blue-200 text-lg">A complete directory of all pages on Kitchenbay.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-blue-950 text-lg mb-4 border-b border-gray-100 pb-3">{section.title}</h2>
                <ul className="space-y-2.5">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} className="text-gray-600 hover:text-[--color-brand-accent] transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[--color-brand-accent] transition-colors shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
