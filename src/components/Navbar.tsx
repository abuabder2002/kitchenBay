'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { subcategories } from '@/lib/mockData';
import logoImg from '../images/logo1.png';
import { ShoppingCart, Search, Menu, X, Heart, UserCircle2, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAuth } from '@/lib/authContext';
import { useProducts } from '@/lib/productsContext';

export default function Navbar() {
  const router = useRouter();
  const { currentUser: user, logout, isAdmin } = useAuth();
  const { products } = useProducts();
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const searchSuggestions = searchQuery.trim() 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topBarLinks = [
    { label: "Bulk & Corporate Orders", href: "/orders/bulk" },
    { label: "Gift Concierge", href: "/gift-concierge" },
    { label: "Track Your Order", href: "/track" },
    { label: "Contact Us", href: "/contact" }
  ];

  const categories = [
    { id: 'kitchenware', name: "Kitchenware", href: "/products?category=kitchenware" },
    { id: 'dining', name: "Dining", href: "/products?category=dining" },
    { id: 'brass-copper', name: "Brass/Copper", href: "/products?category=brass-copper" },
    { id: 'gifting', name: "Gifting", href: "/gift-concierge" },
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
        <div className="w-full text-center md:w-auto md:text-left truncate px-2">
          🎉 We're New! Get ₹500 off on Your First Order — Use Code: WELCOME500
        </div>
        <div className="hidden md:flex items-center gap-6">
          {topBarLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-[--color-brand-accent-yellow] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Navbar — fixed height so scroll shrink does not reflow the page */}
      <header 
        className={`z-40 w-full sticky top-0 border-b border-[#E6F2FF] bg-white backdrop-blur-md transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[64px] sm:min-h-[72px] lg:min-h-[80px] py-3">
          
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-2 sm:mr-8 h-14 sm:h-16 lg:h-20">
            <Image 
              src={logoImg} 
              alt="Brand Logo" 
              width={540} 
              height={190} 
              className={`object-contain mix-blend-multiply h-full w-auto max-w-[170px] sm:max-w-[250px] lg:max-w-none origin-left transition-transform duration-300 ${scrolled ? 'scale-[0.92]' : 'scale-100'}`}
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
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === cat.name ? 'rotate-180' : 'opacity-60'}`} />
                </Link>
                
                {/* Minimal Dropdown Menu */}
                {activeMenu === cat.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-[#F7F2E8] shadow-2xl border border-[--color-brand-border] py-3 min-w-[280px] z-50 rounded-sm animate-in fade-in zoom-in-95 duration-200">
                    <ul className="flex flex-col">
                      {cat.id === 'gifting' ? (
                        [
                          { name: 'Wedding Gifts', href: '/products?category=gifting&subcategory=wedding' },
                          { name: 'Housewarming Gifts', href: '/products?category=gifting&subcategory=housewarming' },
                          { name: 'Festival Gifts', href: '/products?category=gifting&subcategory=festival' },
                          { name: 'Corporate Gifting', href: '/products?category=gifting&subcategory=corporate' },
                          { name: 'Return Gifts', href: '/products?category=gifting&subcategory=return' },
                          { name: 'Gift Concierge', href: '/gift-concierge' },
                        ].map(sub => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className="text-[12px] font-semibold text-[--color-brand-text] hover:bg-[--color-brand-blue-light] hover:text-[--color-brand-accent] transition-colors block px-6 py-3 uppercase tracking-widest border-l-2 border-transparent hover:border-[--color-brand-blue-text]"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        subcategories
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
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            
            {/* Search Icon / Input */}
            <div className="hidden md:flex items-center relative">
              {isSearchOpen ? (
                <>
                  <div className="flex items-center border-b border-[--color-brand-text] pb-1 animate-in fade-in slide-in-from-right-4 relative z-50 bg-white">
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                      className="bg-transparent outline-none text-sm text-[--color-brand-text] w-48 font-medium placeholder:font-normal placeholder:text-[--color-brand-muted]"
                    />
                    <X size={16} className="text-[--color-brand-muted] cursor-pointer hover:text-[--color-brand-text]" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} />
                  </div>
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                      <ul className="flex flex-col">
                        {searchSuggestions.map(product => (
                          <li key={product.id}>
                            <div 
                              onClick={() => { router.push(`/products/${product.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 p-3 hover:bg-[--color-brand-blue-light] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                            >
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[13px] font-bold text-[--color-brand-text] truncate">{product.name}</span>
                                <span className="text-[11px] font-bold text-[--color-brand-muted] uppercase">₹{product.price}</span>
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
              <Heart size={24} strokeWidth={1.5} className={wishlistItems.length > 0 ? 'text-red-500' : ''} />
              <span className={`absolute top-0 right-0 w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${wishlistItems.length > 0 ? 'bg-red-500' : 'bg-gray-400'}`}>
                {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
              </span>
            </Link>

            {/* Cart — opens slide-out drawer */}
            <button
              onClick={openDrawer}
              className="relative text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors p-2 rounded-full hover:bg-[--color-brand-blue-light]"
              aria-label="Open Cart"
            >
              <ShoppingCart size={24} strokeWidth={1.5} />
              <span className={`absolute top-0 right-0 w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${itemCount > 0 ? '' : 'bg-gray-400'}`} style={itemCount > 0 ? { backgroundColor: 'var(--color-brand-accent)' } : undefined}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[--color-brand-text] ml-2" aria-label="Open Menu">
              <Menu size={26} strokeWidth={1.5} />
            </button>

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
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-6 right-6 -mt-3 pt-4 bg-white shadow-xl border border-gray-100 rounded-b-xl overflow-hidden z-40 max-h-64 overflow-y-auto animate-in fade-in">
                  <ul className="flex flex-col">
                    {searchSuggestions.map(product => (
                      <li key={product.id}>
                        <div 
                          onClick={() => { router.push(`/products/${product.id}`); setMobileOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-3 hover:bg-[--color-brand-blue-light] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-[--color-brand-text] truncate">{product.name}</span>
                            <span className="text-xs font-bold text-[--color-brand-muted] uppercase">₹{product.price}</span>
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
                      <span className="font-extrabold text-[11px] text-[--color-brand-muted] uppercase tracking-widest flex items-center gap-2">
                        {cat.name}
                        {cat.id === 'gifting' && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-[#F5E6C8] text-[#4A3B18] rounded-full shadow-sm">
                            Personalized
                          </span>
                        )}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-0.5">
                      {cat.id === 'gifting' ? (
                        [
                          { name: 'Wedding Gifts', href: '/products?category=gifting&subcategory=wedding' },
                          { name: 'Housewarming Gifts', href: '/products?category=gifting&subcategory=housewarming' },
                          { name: 'Festival Gifts', href: '/products?category=gifting&subcategory=festival' },
                          { name: 'Corporate Gifting', href: '/products?category=gifting&subcategory=corporate' },
                          { name: 'Return Gifts', href: '/products?category=gifting&subcategory=return' },
                          { name: 'Gift Concierge', href: '/gift-concierge' },
                        ].map(sub => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-4 py-3 rounded-lg text-[13px] font-semibold uppercase tracking-wider transition-all ${
                                sub.name === 'Gift Concierge' 
                                  ? 'bg-[--color-brand-accent-yellow]/10 text-[--color-brand-accent-yellow] border border-[--color-brand-accent-yellow]/20 shadow-sm mt-1 flex items-center justify-between'
                                  : 'text-[--color-brand-text] hover:text-[--color-brand-accent] hover:bg-gray-50'
                              }`}
                            >
                              {sub.name}
                              {sub.name === 'Gift Concierge' && <span className="w-2 h-2 bg-[--color-brand-accent-yellow] rounded-full animate-pulse shadow-sm" />}
                            </Link>
                          </li>
                        ))
                      ) : (
                        subcategories
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
                      )}
                    </ul>
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
