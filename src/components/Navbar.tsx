'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// duplicate import removed
import { subcategories } from '@/lib/mockData';
// duplicate import removed
import logoImg from '../images/logo.jpeg';
import { ShoppingCart, Search, Menu, X, Heart, UserCircle2, MapPin, ChevronDown, LogOut, Settings, Pencil } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAuth } from '@/lib/authContext';

export default function Navbar() {
  const router = useRouter();
  const { currentUser: user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    // passive: true lets the browser scroll immediately without waiting for JS
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topBarLinks = [
    { label: "Sell on ArtisanCraft", href: "#" },
    { label: "Gift Cards", href: "#" },
    { label: "Track Your Order", href: "/orders" },
    { label: "Contact Us", href: "#" }
  ];

  const categories = [
    { id: 'kitchenware', name: "Kitchenware", href: "/products?category=kitchenware" },
    { id: 'dining', name: "Dining", href: "/products?category=dining" },
    { id: 'decor', name: "Décor", href: "/products?category=decor" }
  ];

  return (
    <>
      {/* TIER 1: Top Utility Bar */}
      <div className="bg-[--color-brand-top-bar] text-white h-8 text-xs flex items-center px-4 sm:px-6 lg:px-8 justify-between z-50 relative">
        <div className="italic font-light">
          Sign Up & Get ₹500 off on your First Purchase!
        </div>
        <div className="hidden md:flex items-center gap-3">
          {topBarLinks.map((link, idx) => (
            <div key={link.label} className="flex items-center gap-3">
              <Link href={link.href} className="hover:text-blue-200 transition-colors">
                {link.label}
              </Link>
              {idx < topBarLinks.length - 1 && <span className="text-white/60">|</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Container for Tier 2 and Tier 3 */}
      <header className={`z-40 bg-white w-full ${scrolled ? 'sticky top-0 shadow-md' : 'relative'}`}>
        
        {/* TIER 2: Brand + Search + Actions */}
        <div className="border-b border-[--color-brand-border] py-3">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
            
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image src={logoImg} alt="Brand Logo" width={200} height={48} className="object-contain h-12 w-auto" />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <div className="relative w-full flex items-center border-2 border-[--color-brand-accent] rounded-full overflow-hidden bg-white">
                <Search size={20} className="text-[--color-brand-accent] absolute left-4" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search for Tawa, Brass Diya, Copper Bottle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="w-full pl-12 pr-28 py-2.5 outline-none text-[--color-brand-text] bg-transparent"
                />
                <button 
                  suppressHydrationWarning
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="absolute right-1 top-1 bottom-1 bg-[--color-brand-accent] text-white rounded-full px-5 font-semibold text-sm hover:bg-[--color-brand-accent-hover] transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Actions Cluster */}
            <div className="flex items-center gap-6">
              {/* Profile */}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none font-medium text-[15px]"
                  >
                    <span>Hi, {user.name.split(' ')[0]}</span>
                    <ChevronDown size={18} className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-4 w-44 bg-white rounded border border-gray-200 shadow-lg py-2 z-50">
                      <Link href="/profile" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2.5 text-[15px] font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50">
                        My Profile
                      </Link>
                      <Link href="/orders" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2.5 text-[15px] font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50">
                        My Orders
                      </Link>
                      <Link href="/wallet" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2.5 text-[15px] font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50">
                        My Wallet
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2.5 text-[15px] font-medium text-blue-600 hover:bg-blue-50">
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { logout(); setShowUserDropdown(false); router.push('/'); }} className="w-full text-left px-4 py-2.5 text-[15px] font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative flex flex-col items-center group">
                  <div className="absolute -top-11 whitespace-nowrap bg-yellow-100 text-yellow-700 text-[11px] font-bold px-2.5 py-1 rounded shadow-sm before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-t-yellow-100 animate-pulse">
                    Get Offer for Logging in!
                  </div>
                  <Link href="/login" className="flex flex-col items-center gap-1 text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors mt-2">
                    <UserCircle2 size={24} />
                    <span className="text-[10px] font-semibold">Login / Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Find a Store */}
              <Link href="/store-locator" className="hidden lg:flex flex-col items-center gap-1 text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors">
                <MapPin size={24} />
                <span className="text-[10px] font-semibold">Find a Store</span>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative flex flex-col items-center gap-1 text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors">
                <Heart size={24} />
                <span className="hidden sm:block text-[10px] font-semibold">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 w-[18px] h-[18px] bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative flex flex-col items-center gap-1 text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors">
                <ShoppingCart size={24} />
                <span className="hidden sm:block text-[10px] font-semibold">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-[18px] h-[18px] bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileOpen(true)} className="md:hidden flex flex-col items-center gap-1 text-[--color-brand-text]">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* TIER 3: Category Navigation Bar */}
        <div className="hidden md:block border-b border-[--color-brand-border] bg-white relative">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-3">
              {categories.map((cat) => (
                <li 
                  key={cat.name}
                  onMouseEnter={() => setActiveMenu(cat.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link 
                    href={cat.href}
                    className="text-sm font-semibold uppercase tracking-wide text-[--color-brand-text] hover:text-[--color-brand-accent] py-3 border-b-2 border-transparent hover:border-[--color-brand-accent] transition-all duration-200"
                  >
                    {cat.name}
                  </Link>
                  
                  {/* Mega Menu */}
                  {activeMenu === cat.name && (
                    <div className="absolute left-0 right-0 top-full bg-white shadow-xl z-50 border-t-2 border-[--color-brand-accent]">
                      <div className="max-w-[1600px] mx-auto px-8 py-8 grid grid-cols-2 gap-8 md:grid-cols-4">
                        {subcategories
                          .filter(sub => sub.category === cat.id)
                          .map(sub => (
                            <Link
                              key={sub.id}
                              href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                              className="text-sm font-medium text-[--color-brand-muted] hover:text-[--color-brand-accent] transition-colors block py-2"
                            >
                              {sub.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg font-[family-name:var(--font-heading)]">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-4 border-b">
              <div className="relative flex items-center border border-[--color-brand-border] rounded-full overflow-hidden bg-[--color-brand-card]">
                <Search size={18} className="text-[--color-brand-muted] absolute left-3" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                      setMobileOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 outline-none text-sm bg-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col py-2">
                {categories.map(cat => (
                  <li key={cat.name}>
                    <Link href={cat.href} onClick={() => setMobileOpen(false)} className="block px-6 py-3 font-semibold text-[--color-brand-text] border-b border-gray-50">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
