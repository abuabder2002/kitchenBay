'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { subcategories } from '@/lib/mockData';
import logoImg from '../images/logo.jpeg';
import { ShoppingCart, Search, Menu, X, Heart, UserCircle2, MapPin, ChevronDown } from 'lucide-react';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
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

  const executeSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* TIER 1: Top Utility Bar (Minimal) */}
      <div className="bg-[--color-brand-top-bar] text-[--color-brand-bg] h-8 text-[11px] flex items-center px-4 sm:px-6 lg:px-8 justify-between z-50 relative tracking-widest font-medium uppercase">
        <div>
          Sign Up & Get ₹500 off on your First Purchase
        </div>
        <div className="hidden md:flex items-center gap-6">
          {topBarLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-[--color-brand-accent-yellow] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header 
        className={`z-40 w-full transition-all duration-500 backdrop-blur-md ${scrolled ? 'sticky top-0 shadow-sm py-2' : 'relative py-4'} border-b border-[#D8C2AE]/40`}
        style={{
          background: 'linear-gradient(110deg, rgba(245, 241, 232, 0.95) 0%, rgba(216, 194, 174, 0.85) 25%, rgba(184, 194, 165, 0.8) 50%, rgba(168, 182, 196, 0.8) 75%, rgba(141, 110, 99, 0.6) 100%)'
        }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-8">
            <Image 
              src={logoImg} 
              alt="Brand Logo" 
              width={280} 
              height={90} 
              className={`object-contain mix-blend-multiply transition-all duration-300 ${scrolled ? 'h-14 lg:h-16' : 'h-20 lg:h-28'} w-auto`} 
              priority 
            />
          </Link>

          {/* CENTER: Desktop Categories */}
          <nav className="hidden lg:flex items-center gap-10 h-full">
            {categories.map((cat) => (
              <div 
                key={cat.name}
                className="h-full flex items-center relative group cursor-pointer"
                onMouseEnter={() => setActiveMenu(cat.name)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href={cat.href}
                  className="text-[13px] font-bold uppercase tracking-widest text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors flex items-center gap-1.5"
                >
                  {cat.name}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === cat.name ? 'rotate-180' : 'opacity-60'}`} />
                </Link>
                
                {/* Minimal Dropdown Menu */}
                {activeMenu === cat.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-[#F7F2E8] shadow-2xl border border-[--color-brand-border] py-3 min-w-[280px] z-50 rounded-sm animate-in fade-in zoom-in-95 duration-200">
                    <ul className="flex flex-col">
                      {subcategories
                        .filter(sub => sub.category === cat.id)
                        .map(sub => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                              className="text-[12px] font-semibold text-[--color-brand-text] hover:bg-[--color-brand-card] hover:text-[--color-brand-accent] transition-colors block px-6 py-3 uppercase tracking-widest"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-6">
            
            {/* Search Icon / Input */}
            <div className="hidden md:flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center border-b border-[--color-brand-text] pb-1 animate-in fade-in slide-in-from-right-4">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                    className="bg-transparent outline-none text-sm text-[--color-brand-text] w-48 font-medium placeholder:font-normal placeholder:text-[--color-brand-muted]"
                  />
                  <X size={16} className="text-[--color-brand-muted] cursor-pointer hover:text-[--color-brand-text]" onClick={() => setIsSearchOpen(false)} />
                </div>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors" aria-label="Search">
                  <Search size={22} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Find Store */}
            <Link href="/store-locator" className="hidden lg:block text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors" aria-label="Find Store">
              <MapPin size={22} strokeWidth={1.5} />
            </Link>

            {/* Profile */}
            <div 
              className="relative hidden sm:block"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <Link href={user ? "/profile" : "/login"} className="text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors flex items-center">
                <UserCircle2 size={22} strokeWidth={1.5} />
              </Link>
              
              {showUserDropdown && user && (
                <div className="absolute right-0 top-full pt-4 w-56 z-50">
                  <div className="bg-white border border-[--color-brand-border] shadow-xl py-2 rounded-sm">
                    <div className="px-5 py-3 border-b border-[--color-brand-border] mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--color-brand-text]">Hi, {user.name.split(' ')[0]}</p>
                    </div>
                    <Link href="/profile" className="block px-5 py-2.5 text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-card]">My Profile</Link>
                    <Link href="/orders" className="block px-5 py-2.5 text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-card]">My Orders</Link>
                    <Link href="/wallet" className="block px-5 py-2.5 text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-card]">My Wallet</Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-5 py-2.5 text-sm font-bold text-[--color-brand-accent] hover:bg-[--color-brand-card]">Admin Dashboard</Link>
                    )}
                    <button onClick={() => { logout(); router.push('/'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 mt-1 border-t border-[--color-brand-border]">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors" aria-label="Wishlist">
              <Heart size={22} strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors" aria-label="Cart">
              <ShoppingCart size={22} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[--color-brand-text] ml-2" aria-label="Open Menu">
              <Menu size={26} strokeWidth={1.5} />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-[--color-brand-bg] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[--color-brand-border]">
              <span className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[--color-brand-text]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-[--color-brand-muted] hover:text-[--color-brand-text] transition-colors">
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="p-6 border-b border-[--color-brand-border]">
              <div className="relative flex items-center border border-[--color-brand-border] rounded-sm overflow-hidden bg-white">
                <Search size={18} className="text-[--color-brand-muted] absolute left-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                      setMobileOpen(false);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 outline-none text-sm font-medium text-[--color-brand-text]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ul className="flex flex-col gap-6">
                {categories.map(cat => (
                  <li key={cat.name}>
                    <div className="mb-3">
                      <Link 
                        href={cat.href} 
                        onClick={() => setMobileOpen(false)} 
                        className="font-bold text-lg uppercase tracking-widest text-[--color-brand-text]"
                      >
                        {cat.name}
                      </Link>
                    </div>
                    <ul className="flex flex-col gap-3 pl-4 border-l border-[--color-brand-border]">
                      {subcategories
                        .filter(sub => sub.category === cat.id)
                        .map(sub => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                              onClick={() => setMobileOpen(false)}
                              className="text-sm font-medium text-[--color-brand-muted] hover:text-[--color-brand-text] uppercase tracking-wider block py-1"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 border-t border-[--color-brand-border] bg-[--color-brand-card]">
              <Link href={user ? "/profile" : "/login"} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm text-[--color-brand-text] mb-6">
                <UserCircle2 size={20} />
                {user ? `Hi, ${user.name.split(' ')[0]}` : 'Login / Sign Up'}
              </Link>
              <Link href="/store-locator" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm text-[--color-brand-text]">
                <MapPin size={20} />
                Find a Store
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
