'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ChevronRight, Truck, RotateCcw, Store, Pencil
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useAuth } from '@/lib/authContext';

interface TraditionVideo {
  id: string;
  videoUrl: string;
  title: string;
  thumbnail: string | null;
  link: string | null;
}

// ── Static data moved OUTSIDE the component ─────────────────────────────────
// These arrays never change so there is no reason to recreate them on every
// render. Keeping them at module level removes them from the React hot-path.

const slides = [
  {
    title: "Traditional Cookware Sale",
    img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
    sub: "Handcrafted Cast Iron & Brassware",
    cta: "Upto 30% Off"
  },
  {
    title: "Elevate Your Dining",
    img: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop",
    sub: "Exquisite Ceramic & Clay Platters",
    cta: "Up to 40% Off"
  },
  {
    title: "Light Up Your Home",
    img: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=800&auto=format&fit=crop",
    sub: "Traditional Brass Lamps & Diyas",
    cta: "Starting ₹499"
  }
];

const categories = [
  { name: 'Kitchenware', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop' },
  { name: 'Dining',      img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=200&auto=format&fit=crop' },
  { name: 'Décor',       img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&auto=format&fit=crop' },
];

const buyingGuides = [
  { title: "Choosing The Right Cast Iron Cookware?",       img: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=300&auto=format&fit=crop" },
  { title: "How To Care For Soapstone Cookware?",          img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=300&auto=format&fit=crop" },
  { title: "Secrets of Perfect Filter Coffee",              img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop" },
  { title: "Styling Ceramic Plates & Bowls?",              img: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=300&auto=format&fit=crop" },
  { title: "Traditional Brass Diyas For Festive Decor?",   img: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=300&auto=format&fit=crop" },
];

const testimonials = [
  { name: "Michelle Rose",     review: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.",           img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200&auto=format&fit=crop", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Paras Chugh",       review: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!",                    img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=200&auto=format&fit=crop", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Prabhas Upadhyay",  review: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.",                           img: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=200&auto=format&fit=crop", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Jayavant Jadhav",   review: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!",                                img: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=200&auto=format&fit=crop", avatar: "https://i.pravatar.cc/150?u=4" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [currentSlide, setCurrentSlide]       = useState(0);
  const [traditionVideos, setTraditionVideos] = useState<TraditionVideo[]>([]);
  const { products }                          = useProducts();
  const { isAdmin }                           = useAuth();

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTraditionVideos(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []); // slides.length is a constant — no need to list it as a dependency

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);

  // Memoize derived product lists — only recomputes if `products` changes
  const bestsellers = useMemo(() => products.slice(0, 8),          [products]);
  const newArrivals = useMemo(() => products.slice(4, 9),          [products]);
  const recommended = useMemo(() => [...products].slice(0, 8).reverse(), [products]);

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1">

        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="py-6 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">

            {/* Top Row */}
            <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[472px]">

              {/* Left Static Banner */}
              <div className="relative w-full lg:w-[67%] h-[300px] lg:h-full rounded-sm overflow-hidden group bg-gray-100 flex-shrink-0 cursor-pointer">
                {/* priority: this is the LCP image — load it immediately */}
                <Image
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop"
                  alt="All Things Handcrafted Sale"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 67vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent p-10 flex flex-col justify-center">
                  <span className="text-xl font-medium text-gray-800">All Things</span>
                  <h2 className="text-5xl md:text-6xl font-[family-name:var(--font-heading)] font-black text-blue-600 mt-1 mb-2 leading-none">ARTISANAL<span className="text-4xl md:text-5xl font-light text-gray-800 italic">sale</span></h2>
                  <p className="text-xl md:text-2xl font-medium text-gray-800 mt-2">Upto <span className="text-2xl md:text-3xl font-bold">50% Off</span> <span className="text-yellow-500">+ 15% Cashback</span></p>
                  <p className="text-yellow-500 font-medium mt-1">Free Shipping on Kitchen &amp; Dining</p>
                </div>
                <div className="absolute top-6 left-6 bg-white text-[10px] font-bold rounded-full w-16 h-16 flex items-center justify-center text-center shadow-lg leading-tight text-gray-800">
                  ENDING<br/>TODAY
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Hero Banner'); }}
                    className="absolute top-6 right-6 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-20 shadow-lg"
                    title="Edit Image"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              {/* Right Carousel */}
              <div className="relative w-full lg:w-[33%] h-[300px] lg:h-full rounded-sm overflow-hidden bg-gray-100 cursor-pointer">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <Image
                      src={slide.img}
                      alt={slide.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-8 left-8 pr-8 text-gray-900">
                      <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1 leading-tight">{slide.title}</h3>
                      <p className="text-lg font-medium">{slide.sub}</p>
                      <p className="text-sm font-bold mt-2">{slide.cta}</p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                  className="absolute right-4 bottom-4 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-colors text-gray-800"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(idx); }}
                      className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Carousel Image'); }}
                    className="absolute top-6 right-6 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-20 shadow-lg"
                    title="Edit Image"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row — 3 Banners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[110px]">

              <div className="relative w-full h-[110px] rounded-sm overflow-hidden bg-gray-100 group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=400&auto=format&fit=crop"
                  alt="Heritage Cast Iron Cookware"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent p-4 flex flex-col justify-center">
                  <span className="text-gray-900 font-bold text-sm leading-tight max-w-[120px]">Heritage Cast Iron<br/>Cookware &rarr;</span>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Banner 1'); }} className="absolute top-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10 shadow"><Pencil size={14} /></button>
                )}
              </div>

              <div className="relative w-full h-[110px] rounded-sm overflow-hidden bg-gray-100 group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400&auto=format&fit=crop"
                  alt="Premium Dining Essentials"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-center">
                  <span className="text-white font-bold text-sm leading-tight">Handcrafted Ceramics &amp;<br/>Dining Plates &rarr;</span>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Banner 2'); }} className="absolute top-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10 shadow"><Pencil size={14} /></button>
                )}
              </div>

              <div className="relative w-full h-[110px] rounded-sm overflow-hidden bg-gray-100 group cursor-pointer">
                <Image
                  src="/images/products/traditional_brass_diya.png"
                  alt="Traditional Pooja Diyas at 30% Off"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 p-4 flex flex-col justify-center">
                  <span className="text-white font-bold text-sm leading-tight">Handcrafted Diyas &amp;<br/>Festival Pooja Essentials<br/>At 30% Off &rarr;</span>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Banner 3'); }} className="absolute top-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10 shadow"><Pencil size={14} /></button>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── SHOP BY CATEGORY ──────────────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 justify-center mb-8">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Shop By Category</h2>
            {isAdmin && (
              <button onClick={() => alert('Edit Categories Section')} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors font-semibold">
                <Pencil size={12} /> Edit Section
              </button>
            )}
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-3 max-w-4xl mx-auto md:gap-6 scrollbar-hide">
            {categories.map((cat, idx) => (
              <div key={idx} className="relative group cursor-pointer flex-shrink-0 w-40 h-40 md:w-full md:h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/products?category=${cat.name.toLowerCase()}`} className="block w-full h-full relative">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 160px, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold text-white tracking-wide shadow-black/50 drop-shadow-md">{cat.name}</span>
                  </div>
                </Link>
                {isAdmin && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert(`Edit Category Image: ${cat.name}`); }} className="absolute top-3 right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow z-10">
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── BESTSELLERS ───────────────────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Bestsellers This Week</h2>
              {isAdmin && (
                <button onClick={() => alert('Edit Bestsellers Section')} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors font-semibold">
                  <Pencil size={12} /> Edit List
                </button>
              )}
            </div>
            <Link href="/products" className="text-[--color-brand-accent] text-sm font-medium hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── BUYING GUIDES ─────────────────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-blue-700 text-center mb-8">Artisanal Buying Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {buyingGuides.map((item, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer border border-gray-200 shadow-sm">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-white text-sm font-semibold leading-tight block">{item.title} &rarr;</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Guide Image'); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10 shadow"
                    title="Edit Image"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* Download App Banner */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-blue-700 text-white flex flex-col items-center justify-center p-4">
              <h3 className="font-bold text-center text-sm md:text-base leading-tight mb-4">Flat Rs. 250 Off<br/>On Your First Purchase</h3>
              <div className="bg-white p-2 rounded w-24 h-24 flex items-center justify-center">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://artisancraft.com"
                  alt="QR Code"
                  width={88}
                  height={88}
                  loading="lazy"
                />
              </div>
              <div className="mt-4 font-bold text-xs tracking-wide">DOWNLOAD NOW</div>
            </div>
          </div>
        </section>

        {/* ── NEW ARRIVALS ──────────────────────────────────────────────────── */}
        {newArrivals.length >= 5 && (
          <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">New Arrivals</h2>
                {isAdmin && (
                  <button onClick={() => alert('Edit New Arrivals Section')} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors font-semibold">
                    <Pencil size={12} /> Edit List
                  </button>
                )}
              </div>
              <Link href="/products?sort=newest" className="text-[--color-brand-accent] text-sm font-medium hover:underline">
                See All New &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 md:row-span-2">
                <ProductCard product={newArrivals[0]} isHero />
              </div>
              <div className="hidden md:block"><ProductCard product={newArrivals[1]} /></div>
              <div className="hidden md:block"><ProductCard product={newArrivals[2]} /></div>
              <div className="hidden md:block"><ProductCard product={newArrivals[3]} /></div>
              <div className="hidden md:block"><ProductCard product={newArrivals[4]} /></div>
            </div>
          </section>
        )}

        {/* ── TRADITIONS VIDEOS ─────────────────────────────────────────────── */}
        {traditionVideos.length > 0 && (
          <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 relative">
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-center w-full text-[--color-brand-text]">Explore our Traditions!</h2>
              {isAdmin && (
                <Link href="/admin/videos" className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors font-semibold absolute right-0">
                  <Pencil size={12} /> Edit Videos
                </Link>
              )}
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
              {traditionVideos.map((video) => (
                <div key={video.id} className="relative w-[280px] sm:w-[320px] aspect-[9/16] shrink-0 snap-center rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
                  {/* preload="none" — don't download video data until the user hovers */}
                  <video
                    src={video.videoUrl}
                    poster={video.thumbnail || undefined}
                    className="w-full h-full object-cover"
                    muted loop playsInline
                    preload="none"
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => {
                      const v = e.target as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="bg-white p-3 rounded flex items-center gap-3">
                      {video.thumbnail && (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          width={40}
                          height={40}
                          className="object-cover rounded shadow"
                          loading="lazy"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm">{video.title}</h3>
                    </div>
                  </div>
                  {video.link && (
                    <Link href={video.link} className="absolute inset-0 z-10">
                      <span className="sr-only">View Product</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin/videos" className="absolute top-4 right-4 z-20 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow">
                      <Pencil size={14} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Block */}
            <div className="bg-blue-50 flex-shrink-0 w-full lg:w-1/3 p-10 flex flex-col justify-center items-start rounded relative overflow-hidden">
              <span className="text-8xl text-yellow-400 font-serif leading-none absolute top-4 left-4 opacity-20">&ldquo;</span>
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-blue-700 leading-tight mb-4 relative z-10">
                See Why<br/>They Love Us
              </h2>
              <p className="text-gray-600 font-medium relative z-10">Trusted By Over 11 Million Customers</p>
              <div className="self-end mt-4 relative z-10">
                <span className="text-6xl text-yellow-400 font-serif leading-none transform rotate-180 inline-block">&rdquo;</span>
              </div>
            </div>

            {/* Right Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-gray-50 p-6 flex gap-4 items-start relative rounded border border-gray-100 overflow-hidden group">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                    loading="lazy"
                  />
                  <div className="flex-1 pr-16 md:pr-20 z-10">
                    <p className="text-xs md:text-sm italic text-gray-700 mb-3 line-clamp-3">&ldquo;{t.review}&rdquo;</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900">- {t.name}</p>
                    <div className="flex text-yellow-400 text-xs mt-1">★★★★★</div>
                  </div>
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-white border border-gray-200 shadow-sm rotate-6 p-1 z-0 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
                    <div className="relative w-full h-full">
                      <Image src={t.img} alt={t.name} fill className="object-cover" sizes="96px" loading="lazy" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU ───────────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── BRAND TRUST STRIP ─────────────────────────────────────────────── */}
        <section className="border-t border-gray-200 py-10 bg-white mt-12 mb-8">
          <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-around gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-3 flex-1 px-4 py-4 md:py-0 justify-center">
              <Truck className="text-blue-600" size={36} />
              <h4 className="text-base md:text-lg font-bold text-gray-900 leading-tight">11 Million<br/>Happy Deliveries</h4>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 flex-1 px-4 py-4 md:py-0 justify-center">
              <Store className="text-blue-600" size={36} />
              <h4 className="text-base md:text-lg font-bold text-gray-900 leading-tight">150+ Stores<br/>Across 100+ Cities</h4>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 flex-1 px-4 py-4 md:py-0 justify-center">
              <RotateCcw className="text-blue-600" size={36} />
              <h4 className="text-base md:text-lg font-bold text-gray-900 leading-tight">7 Day Easy<br/>Return Policy</h4>
            </div>
          </div>
        </section>

        {/* ── SEO SECTION ───────────────────────────────────────────────────── */}
        <section className="py-12 bg-gray-50 border-t border-gray-200 mt-10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-600 text-justify">
            <h1 className="text-xl font-bold text-gray-900 mb-4">India&apos;s Premium Destination for Authentic Handcrafted Kitchenware, Dining &amp; Traditional Home Décor</h1>
            <p className="mb-4">
              Welcome to ArtisanCraft, your one-stop shop for premium handcrafted kitchenware, fine dining essentials, and traditional Indian home décor online. Whether you are setting up an authentic traditional kitchen, seeking elegant brass and copper utensils, or decorating your home with beautiful diyas and pooja essentials, our extensive collection caters to every style. From durable cast iron cookwares and traditional soapstone vessels to exquisite brass coffee dabaras and dining plates, our curated selection guarantees premium quality and unmatched longevity.
            </p>
            <p className="mb-4">
              Shopping for kitchenware and décor online in India has never been easier. Benefit from our seasonal mega sales, offering up to 50% off along with exclusive cashback deals and free sitewide shipping. Experience the joy of a hassle-free shopping journey backed by a 7-day easy return policy and secure payment gateways. Our expert buying guides will help you choose the right cast iron skillet, soapstone pot, or pooja essentials perfectly tailored to your home.
            </p>
            <p>
              Join over 11 million happy customers and step into a world of traditional, premium, and handcrafted living spaces today!
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
