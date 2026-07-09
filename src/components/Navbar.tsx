'use client';
// Force compile to clear HMR hydration cache

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { subcategories } from '@/lib/mockData';
import logoImg from '../images/logo.jpeg';
import { ShoppingCart, Search, Menu, X, Heart, UserCircle2, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAuth } from '@/lib/authContext';
import { useProducts } from '@/lib/productsContext';

export default function Navbar() {
  const router = useRouter();
  const { currentUser: user, logout, isAdmin } = useAuth();
  const { products } = useProducts();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const ads = [
    { 
      badge: "OFFER",
      text: "🔑 Log in to your account & get Rs. 100 off!", 
      href: "/login" 
    },
    { 
      badge: "SHIPPING",
      text: "🚚 Free shipping on orders above Rs. 2000!", 
      href: "/products" 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIdx((prev) => (prev + 1) % ads.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [ads.length]);

  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 50); // slight delay for smooth expansion
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen]);

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const cacheRef = useRef<Record<string, any[]>>({});

  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [dynamicSubcategories, setDynamicSubcategories] = useState<any[]>(subcategories);

  useEffect(() => {
    // 1. Fetch categories dynamically
    fetch('/api/admin/categories?limit=100&isActive=true')
      .then(res => res.ok ? res.json() : {})
      .then((data: any) => {
        if (data.categories) {
          const mappedCats = data.categories.map((c: any) => ({
            id: c.slug,
            name: c.name,
            href: `/products?category=${c.slug}`
          }));
          setDynamicCategories(mappedCats);
        }
      })
      .catch(console.error);

    // 2. Fetch subcategories dynamically
    fetch('/api/admin/subcategories?limit=100&isActive=true')
      .then(res => res.json())
      .then((data: any) => {
        if (data.subcategories && data.subcategories.length > 0) {
          const mappedSubs = data.subcategories.map((s: any) => ({
            id: s.slug,
            name: s.name,
            category: s.category?.slug || ''
          }));
          setDynamicSubcategories(mappedSubs);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    if (cacheRef.current[q]) {
      setSuggestions(cacheRef.current[q]);
      return;
    }

    const controller = new AbortController();
    setSuggestionsLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : [])
        .then((data: any) => {
          if (Array.isArray(data)) {
            const sliced = data.slice(0, 6);
            cacheRef.current[q] = sliced;
            setSuggestions(sliced);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Suggestions fetch error:", err);
          }
        })
        .finally(() => {
          setSuggestionsLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else if (window.scrollY < 20) {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topBarLinks = [
    { label: "Sell on Kitchenbay", href: "#" },
    { label: "Gift Concierge", href: "/gift-concierge" },
    { label: "Track Your Order", href: "/track" },
    { label: "Contact Us", href: "/contact" }
  ];

  const categories = useMemo(() => {
    const list = dynamicCategories.length === 0
      ? [
          { id: 'kitchenware', name: "Kitchenware", href: "/products?category=kitchenware" },
          { id: 'kitchen-appliances', name: "Kitchen Appliances", href: "/products?category=kitchen-appliances" },
          { id: 'dining', name: "Dining", href: "/products?category=dining" },
          { id: 'brass-copper', name: "Brass/Copper", href: "/products?category=brass-copper" },
          { id: 'decor', name: "Décor", href: "/products?category=decor" },
          { id: 'gifting', name: "Gifting", href: "/gift-concierge" }
        ]
      : [
          ...dynamicCategories,
          { id: 'gifting', name: "Gifting", href: "/gift-concierge" }
        ];

    const order = ['kitchenware', 'kitchen-appliances', 'dining', 'brass-copper', 'decor', 'gifting'];

    return [...list].sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      const scoreA = indexA === -1 ? 999 : indexA;
      const scoreB = indexB === -1 ? 999 : indexB;
      return scoreA - scoreB;
    });
  }, [dynamicCategories]);

  const executeSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* TIER 1: Top Utility Bar (Minimal) */}
      <div className="bg-[--color-brand-top-bar] text-[--color-brand-bg] h-9 text-[11px] flex items-center px-4 sm:px-6 lg:px-8 justify-between z-50 relative tracking-widest font-medium uppercase overflow-hidden">
        <div className="hidden md:flex items-center gap-6">
          {topBarLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-[--color-brand-accent-yellow] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Moving advertisement side animation */}
        <div className="flex-1 md:flex-none flex items-center justify-center md:justify-end overflow-hidden relative h-5 select-none md:min-w-[340px]">
          {ads.map((ad, idx) => (
            <Link
              key={idx}
              href={ad.href}
              className={`absolute inset-0 flex items-center justify-center md:justify-end transition-all duration-700 ease-in-out whitespace-nowrap text-center text-[10px] md:text-[11px] font-bold ${
                idx === currentAdIdx
                  ? 'opacity-100 translate-x-0'
                  : idx === (currentAdIdx - 1 + ads.length) % ads.length
                  ? 'opacity-0 -translate-x-full pointer-events-none'
                  : 'opacity-0 translate-x-full pointer-events-none'
              } hover:text-[--color-brand-accent-yellow]`}
            >
              <span className={`relative overflow-hidden mr-2 px-1.5 py-0.5 text-[8.5px] font-extrabold rounded-sm tracking-normal leading-none shrink-0 ${
                ad.badge === 'OFFER' ? 'bg-[#FFEA00] text-black' : 'bg-green-500 text-white'
              }`}>
                {/* Glistening Shimmer Effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
                <span className="relative z-10">{ad.badge}</span>
              </span>
              <span className="text-[--color-brand-bg]">{ad.text}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Search Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSearchOpen(false)}
      />

      {/* Main Navbar */}
      <header
        className={`z-50 w-full transition-all duration-500 sticky top-0 border-b border-[#E6F2FF] ${scrolled ? 'shadow-sm py-2 bg-white/70 backdrop-blur-lg' : 'py-4 bg-white backdrop-blur-none'}`}
      >
        <div className={`transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between ${
          isMobileSearchOpen ? 'opacity-0 scale-95 -translate-x-4 pointer-events-none lg:opacity-100 lg:scale-100 lg:translate-x-0 lg:pointer-events-auto' : 'opacity-100 scale-100 translate-x-0'
        }`}>

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-2 sm:mr-8">
            <Image
              src={logoImg}
              alt="Brand Logo"
              width={180}
              height={63}
              className={`object-contain mix-blend-multiply transition-all duration-300 ${scrolled ? 'h-10 sm:h-12 lg:h-14' : 'h-12 sm:h-14 lg:h-18'} w-auto`}
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
                  className="text-[13px] font-bold uppercase tracking-widest text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-[--color-brand-blue-light]"
                >
                  {cat.name}
                  {cat.id === 'gifting' && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-[#F5E6C8] text-[#4A3B18] rounded-full leading-none whitespace-nowrap">
                      Personalized
                    </span>
                  )}
                  {cat.id !== 'gifting' && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === cat.name ? 'rotate-180' : 'opacity-60'}`} />
                  )}
                </Link>

                {/* Minimal Dropdown Menu */}
                {activeMenu === cat.name && cat.id !== 'gifting' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-[#F7F2E8] shadow-2xl border border-[--color-brand-border] py-3 min-w-[280px] z-50 rounded-sm animate-in fade-in zoom-in-95 duration-200">
                    <ul className="flex flex-col">
                      {dynamicSubcategories
                        .filter(sub => sub.category === cat.id)
                        .map(sub => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                              className="text-[12px] font-semibold text-[--color-brand-text] hover:bg-[--color-brand-blue-light] hover:text-[--color-brand-accent] transition-colors block px-6 py-3 uppercase tracking-widest border-l-2 border-transparent hover:border-[--color-brand-blue-text]"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">

            {/* Desktop Search Icon / Input */}
            <div className="hidden lg:flex items-center relative">
              {isSearchOpen ? (
                <>
                  <div className="flex items-center border-b border-[--color-brand-text] pb-1 animate-in fade-in slide-in-from-right-4 absolute right-0 sm:relative z-50 bg-white">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search..."
                      aria-label="Search for products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                      className="bg-transparent outline-none text-sm text-[--color-brand-text] w-28 sm:w-48 font-medium placeholder:font-normal placeholder:text-[--color-brand-muted]"
                    />
                    <X size={16} className="text-[--color-brand-muted] cursor-pointer hover:text-[--color-brand-text]" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute top-full right-0 sm:left-0 sm:right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 w-[280px] sm:w-auto">
                      <ul className="flex flex-col">
                        {suggestions.map(product => (
                          <li key={product.id}>
                            <div
                              onClick={() => { router.push(`/products/${product.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 p-3 hover:bg-[--color-brand-blue-light] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                            >
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[13px] font-bold text-[--color-brand-text] truncate">{product.name}</span>
                                <span className="text-[11px] font-bold text-[--color-brand-muted] uppercase">Rs. {product.price}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors p-2 rounded-full hover:bg-[--color-brand-blue-light]" aria-label="Search">
                  <Search size={22} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Mobile Search Icon (Triggers Expansion) */}
            <button 
              onClick={() => setIsMobileSearchOpen(true)} 
              className="lg:hidden text-[--color-brand-text] hover:text-[--color-brand-accent] transition-transform active:scale-90 p-2 rounded-full hover:bg-[--color-brand-blue-light]" 
              aria-label="Search"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Find Store */}
            <Link href="/store-locator" className="hidden lg:block text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors p-2 rounded-full hover:bg-[--color-brand-blue-light]" aria-label="Find Store">
              <MapPin size={22} strokeWidth={1.5} />
            </Link>

            {/* Profile */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <Link href={user ? "/profile" : "/login"} className="text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors flex items-center p-2 rounded-full hover:bg-[--color-brand-blue-light]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-[22px] h-[22px] rounded-full object-cover" />
                ) : (
                  <UserCircle2 size={22} strokeWidth={1.5} />
                )}
              </Link>

              {showUserDropdown && user && (
                <div className="absolute right-0 top-full pt-4 w-56 z-50">
                  <div className="bg-white border border-[--color-brand-border] shadow-xl py-2 rounded-sm">
                    <div className="px-5 py-3 border-b border-[--color-brand-border] mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--color-brand-text]">Hi, {user.name.split(' ')[0]}</p>
                    </div>
                    <Link href="/profile" className="block px-5 py-2.5 text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-card]">My Profile</Link>
                    <Link href="/orders" className="block px-5 py-2.5 text-sm font-medium text-[--color-brand-text] hover:bg-[--color-brand-card]">My Orders</Link>
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
            <Link href="/wishlist" className="relative text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors p-2 rounded-full hover:bg-[--color-brand-blue-light]" aria-label="Wishlist">
              <Heart size={22} strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors p-2 rounded-full hover:bg-[--color-brand-blue-light]" aria-label="Cart">
              <ShoppingCart size={22} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[--color-brand-accent] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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

        {/* Premium Mobile Search Overlay (Absolute over Navbar) */}
        <div
          className={`lg:hidden absolute inset-0 bg-transparent z-[60] px-4 flex items-center justify-center transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
            isMobileSearchOpen 
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
              : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
          }`}
        >
          <div className={`relative w-full flex items-center bg-gray-50 rounded-full border border-gray-200 shadow-sm transition-all duration-300 overflow-visible ${
            isMobileSearchOpen ? 'ring-4 ring-[--color-brand-accent]/15 bg-white' : ''
          }`}>
            <Search size={20} className="text-[--color-brand-muted] absolute left-4 transition-transform duration-300" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search premium kitchenware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeSearch();
                  setIsMobileSearchOpen(false);
                }
              }}
              className="w-full pl-11 pr-12 py-3 bg-transparent outline-none text-[15px] font-medium text-[--color-brand-text] placeholder:text-[--color-brand-muted]/70 placeholder:font-normal placeholder:transition-opacity placeholder:duration-300"
            />
            <button 
              onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
              className={`absolute right-2 p-1.5 text-[--color-brand-muted] hover:text-[--color-brand-text] bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isMobileSearchOpen ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
              }`}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            
            {/* Search Suggestions Dropdown for Mobile */}
            {suggestions.length > 0 && isMobileSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white shadow-2xl border border-gray-100 rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <ul className="flex flex-col">
                  {suggestions.map((product, i) => (
                    <li key={product.id} className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                      <div
                        onClick={() => { router.push(`/products/${product.id}`); setIsMobileSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-3.5 hover:bg-[--color-brand-blue-light] active:bg-gray-100 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      >
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0 shadow-sm" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[14px] font-bold text-[--color-brand-text] truncate">{product.name}</span>
                          <span className="text-[12px] font-bold text-[--color-brand-muted] uppercase">Rs. {product.price}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Category UI Bar (Only visible on mobile) */}
      <div className="lg:hidden w-full bg-white border-b border-[#E6F2FF] overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex px-4 py-2.5 gap-3 min-w-max">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={cat.href}
              className="text-[11px] font-extrabold uppercase tracking-widest text-[--color-brand-text] hover:text-[--color-brand-accent] flex items-center gap-1.5 whitespace-nowrap bg-[#F7F2E8] px-4 py-2 rounded-full border border-[#E6DBC4]/60 shadow-sm transition-colors"
            >
              {cat.name}
              {cat.id === 'gifting' && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-white text-[#4A3B18] rounded-full shadow-sm">
                  Personalized
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[--color-brand-text]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-[--color-brand-muted] hover:text-[--color-brand-text] transition-colors p-2 -mr-2">
                <X size={26} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 border-b border-gray-100 relative">
              <div className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 z-50">
                <Search size={18} className="text-[--color-brand-muted] absolute left-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                      setMobileOpen(false);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 outline-none text-sm font-medium text-[--color-brand-text] bg-transparent"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-6 right-6 -mt-3 pt-4 bg-white shadow-xl border border-gray-100 rounded-b-xl overflow-hidden z-40 max-h-64 overflow-y-auto animate-in fade-in">
                  <ul className="flex flex-col">
                    {suggestions.map(product => (
                      <li key={product.id}>
                        <div
                          onClick={() => { router.push(`/products/${product.id}`); setMobileOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-3 hover:bg-[--color-brand-blue-light] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-[--color-brand-text] truncate">{product.name}</span>
                            <span className="text-xs font-bold text-[--color-brand-muted] uppercase">Rs. {product.price}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ul className="flex flex-col gap-6">
                {categories.map(cat => (
                  <li key={cat.name}>
                    <div className="mb-3 px-2">
                      <Link href={cat.href} onClick={() => setMobileOpen(false)} className="font-extrabold text-[11px] text-[--color-brand-muted] hover:text-[--color-brand-accent] uppercase tracking-widest flex items-center gap-2">
                        {cat.name}
                        {cat.id === 'gifting' && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-[#F5E6C8] text-[#4A3B18] rounded-full shadow-sm">
                            Personalized
                          </span>
                        )}
                      </Link>
                    </div>
                    {cat.id !== 'gifting' && (
                      <ul className="flex flex-col gap-0.5">
                        {dynamicSubcategories
                          .filter(sub => sub.category === cat.id)
                          .map(sub => (
                            <li key={sub.id}>
                              <Link
                                href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 rounded-lg text-[13px] font-semibold text-[--color-brand-text] hover:text-[--color-brand-accent] hover:bg-gray-50 uppercase tracking-wider transition-all"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))
                        }
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <Link href={user ? "/profile" : "/login"} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-extrabold uppercase tracking-widest text-sm text-[--color-brand-text] mb-6 hover:text-[--color-brand-accent] transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-[22px] h-[22px] rounded-full object-cover" />
                ) : (
                  <UserCircle2 size={22} />
                )}
                {user ? `Hi, ${user.name.split(' ')[0]}` : 'Login / Sign Up'}
              </Link>
              <Link href="/store-locator" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-extrabold uppercase tracking-widest text-sm text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors">
                <MapPin size={22} />
                Find a Store
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
