'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */


import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import TraditionVideoSection from '@/components/TraditionVideoSection';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, HeartHandshake, Leaf, Users, Star, Quote, MapPin } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useAuth } from '@/lib/authContext';

const categories = [
  { name: 'Kitchenware', sub: 'Traditional Cookware', img: '/images/marketing/modern_world_kitchen.png' },
  { name: 'Dining', sub: 'Handcrafted Serveware', img: '/images/home/modern_luxury_dining_card.png' },
  { name: 'Décor', sub: 'Heritage Home Accents', img: '/images/home/modern_luxury_decor_card.png' },
];

const materials = [
  { name: 'Cast Iron', desc: 'Naturally non-stick & iron fortifying', img: '/images/home/material_cast_iron.png' },
  { name: 'Pure Brass', desc: 'Timeless elegance & health benefits', img: '/images/home/material_pure_brass.png' },
  { name: 'Copper', desc: 'Ayurvedic wellness for water storage', img: '/images/home/material_copper.png' },
  { name: 'Soapstone', desc: 'Slow cooking for perfect flavor', img: '/images/home/material_soapstone.png' }
];

const journalEntries = [
  { title: 'The Lost Art of Hand-Hammered Cookware', category: 'Craftsmanship', img: '/artisan_hammering_copper.png' },
  { title: 'Why Traditional Brass Adds Positive Energy', category: 'Heritage', img: '/artisan_crafting_brass.png' },
  { title: 'Seasoning Your Cast Iron: A Masterclass', category: 'Care Guide', img: '/artisan_forging_cast_iron.png' }
];

const promoSlides = [
  {
    title: "Craftsmanship in Copper",
    subtitle: "Hand-Hammered Elegance",
    image: "/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM (1).jpeg",
    link: "/products?category=decor",
  },
  {
    title: "Versatile Kitchen Companion",
    subtitle: "Versatile Collection",
    image: "/images/home/WhatsApp Image 2026-05-31 at 11.36.37 AM.jpeg",
    link: "/products?category=versatile",
  },
  {
    title: "Cookware Mastery",
    subtitle: "Making Cookware",
    image: "/images/home/WhatsApp Image 2026-05-31 at 11.38.25 AM.jpeg",
    link: "/products?category=decor",
  },
];

export default function HomePage() {
  const { products } = useProducts();
  const { isAdmin } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 50) {
        setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
      } else if (diff < -50) {
        setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
      }
    }
    setTouchStartX(null);
  };

  const bestsellers = useMemo(() => products.slice(0, 4), [products]);
  const newArrivals = useMemo(() => products.slice(4, 8), [products]);
  const recommendedProducts = useMemo(() => [...products].reverse().slice(0, 8), [products]);

  const testimonials = [
    { name: "Michelle Rose", text: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1", productImg: "/images/marketing/everyday_cooking.jpg" },
    { name: "Paras Chugh", text: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!", rating: 5, avatar: "https://i.pravatar.cc/150?img=11", productImg: "/artisan_kitchenware.png" },
    { name: "Prabhas Upadhyay", text: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.", rating: 5, avatar: "https://i.pravatar.cc/150?img=33", productImg: "/journal_cast_iron.png" },
    { name: "Jayavant Jadhav", text: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!", rating: 5, avatar: "https://i.pravatar.cc/150?img=60", productImg: "/journal_brass_energy.png" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1">

        {/* ── NEW HERO SECTION (Banner Grid) ────────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1600px] mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Main Banner (Summer Sale) */}
              <Link href="/products" className="lg:col-span-8 relative w-full h-[300px] sm:h-[400px] md:h-[500px] group overflow-hidden block">
                  <Image
                    src="/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg"
                    alt="Collection for Everyday Cooking"
                    fill
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 sm:p-8 lg:p-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Authentic Handcrafted Kitchenware</h2>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors mt-4">Explore Collection</span>
                  </div>
                </Link>

              {/* Right Side Banner (Premium Slideshow) */}
              <div className="lg:col-span-4 relative w-full h-[300px] sm:h-[400px] md:h-[500px] group overflow-hidden block bg-slate-900" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {promoSlides.map((slide, idx) => (
                  <Link
                    key={idx}
                    href={slide.link}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className={`object-contain object-center transition-transform duration-[4000ms] ease-out ${
                          idx === currentSlide ? 'scale-105' : 'scale-100'
                        }`}
                      />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center pb-12">
                      <span className="text-white/90 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                        {slide.subtitle}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-heading)] leading-tight mb-4">
                        {slide.title}
                      </h3>
                      <span className="border-b border-white/60 pb-1 text-xs font-bold text-white uppercase tracking-widest hover:border-white transition-colors">
                        Explore Collection
                      </span>
                    </div>
                  </Link>
                ))}
                
                {/* Navigation Dots */}
                <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
                  {promoSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BADGES ROW ──────────────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="flex-1 flex items-center justify-center gap-3 py-2 md:py-0">
                <ShieldCheck className="text-gray-600" size={28} />
                <span className="text-sm md:text-base font-bold text-gray-800">11 Million Happy Deliveries</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-3 py-2 md:py-0">
                <Users className="text-gray-600" size={28} />
                <span className="text-sm md:text-base font-bold text-gray-800">150+ Stores Across 100+ Cities</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-3 py-2 md:py-0">
                <RotateCcw className="text-gray-600" size={28} />
                <span className="text-sm md:text-base font-bold text-gray-800">7 Day Easy Return Policy</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FULL WIDTH PROMO BAR ──────────────────────────────────────── */}
        <section className="bg-[#E8F5E9] text-black py-4 relative">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-xl sm:text-2xl italic font-[family-name:var(--font-heading)] font-medium">Now Serving:</span>
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold">Get Upto Rs.1,500 Off On Your First Order</span>
            </div>
            <Link href="/login" className="flex items-center gap-2 text-lg font-bold border-b border-black transition-all duration-300 ease-in-out hover:text-gray-700 hover:border-gray-700 hover:scale-105">
              Sign Up Now <span className="text-xl">&gt;</span>
            </Link>
          </div>
        </section>

        {/* ── 3 CATEGORY BANNERS ────────────────────────────────────────── */}
        <section className="bg-white py-6">
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/products?category=kitchenware" className="relative w-full aspect-[2.5/1] md:aspect-[2/1] overflow-hidden group rounded-sm block bg-slate-100">
                <Image
                  src="/images/home/handi-set-banner-wide.png"
                  alt="Modern Kitchen Collection"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                <div className="absolute top-0 left-0 h-full flex flex-col justify-center p-6 md:p-8 max-w-[60%]">
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Modern Kitchen<br/>Collection &rarr;</h4>
                </div>
              </Link>

              <Link href="/products?category=dining" className="relative w-full aspect-[2.5/1] md:aspect-[2/1] overflow-hidden group rounded-sm block bg-slate-100">
                <Image
                      src="/images/home/durable-cookware-banner-wide.png"
                      alt="Premium Dining Sets"
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-0 left-0 h-full flex flex-col justify-center p-6 md:p-8 max-w-[60%]">
                  <h4 className="text-lg md:text-xl font-bold text-white leading-tight">Premium Dining &amp;<br/>Serveware &rarr;</h4>
                </div>
              </Link>

              <Link href="/products?category=decor" className="relative w-full aspect-[2.5/1] md:aspect-[2/1] overflow-hidden group rounded-sm block bg-slate-100">
                <Image
                  src="/images/home/apple-handi-banner-wide.png"
                  alt="Bring Style Into Everyday Living"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                <div className="absolute top-0 left-0 h-full flex flex-col justify-center p-6 md:p-8 max-w-[60%]">
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Bring Style Into<br/>Everyday Living &rarr;</h4>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CATEGORY SHOWCASE ─────────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Curated Categories</span>
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Discover Our Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.map((cat, idx) => (
              <Link href={`/products?category=${cat.name.toLowerCase()}`} key={idx} className="group flex flex-col items-center cursor-pointer">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm mb-6 shadow-sm">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-2">{cat.name}</h3>
                <p className="text-sm font-medium text-[--color-brand-muted] uppercase tracking-widest">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── ARTISAN STORY SECTION ─────────────────────────────────────── */}
        <section className="bg-[--color-brand-top-bar] text-[--color-brand-bg] py-24">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 lg:pr-12">
                <span className="text-[--color-brand-accent-yellow] text-sm font-semibold tracking-[0.2em] uppercase mb-6 block">Our Heritage</span>
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-8 leading-tight">
                  Reviving Ancient Kitchen Wisdom
                </h2>
                <p className="text-lg text-[--color-brand-bg]/80 mb-6 leading-relaxed">
                  We journey to traditional clusters across India, from the Kansa makers of West Bengal to the cast-iron artisans of Tamil Nadu. By bringing their authentic, handcrafted cookware directly to your home, we help preserve generational skills that modern manufacturing has left behind.
                </p>
                <p className="text-lg text-[--color-brand-bg]/80 mb-10 leading-relaxed">
                  Every utensil is forged with purpose—designed not just to cook food, but to nourish the body according to timeless Ayurvedic principles.
                </p>
                <Link href="/story" className="inline-block border-b-2 border-[--color-brand-accent-yellow] pb-1 text-sm font-bold uppercase tracking-widest hover:text-[--color-brand-accent-yellow] transition-colors">
                  Read Our Story
                </Link>
              </div>
              <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto lg:max-w-none">
                <Image
                  src="/artisan_kitchenware.png"
                  alt="Traditional Indian handcrafted kitchenware"
                  fill
                  className="object-cover rounded-t-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── TRADITION VIDEO SECTION ────────────────────────────────────── */}
        <TraditionVideoSection />

        {/* ── BESTSELLERS ───────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[--color-brand-muted] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Most Loved</span>
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Bestsellers</h2>
            </div>
            <Link href="/products" className="border-b border-[--color-brand-text] pb-1 text-sm font-bold text-[--color-brand-text] uppercase tracking-widest hover:text-[--color-brand-accent] hover:border-[--color-brand-accent] transition-colors hidden md:block">
              Shop All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {bestsellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Link href="/products" className="inline-block border-b border-[--color-brand-text] pb-1 text-sm font-bold text-[--color-brand-text] uppercase tracking-widest">
              Shop All
            </Link>
          </div>
        </section>

        {/* ── TRADITIONAL MATERIALS SHOWCASE ────────────────────────────── */}
        <section className="bg-white py-24">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">The Essence of Earth</h2>
              <p className="text-[--color-brand-muted] mt-4 max-w-2xl mx-auto">Explore our range categorized by the timeless, natural materials that form their foundation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {materials.map((mat, idx) => (
                <Link href={`/products?material=${mat.name}`} key={idx} className="group relative w-full h-[400px] overflow-hidden rounded-sm cursor-pointer">
                  <Image src={mat.img} alt={mat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 pr-6">
                    <h3 className="text-white text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">{mat.name}</h3>
                    <p className="text-white/80 text-sm">{mat.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEW ARRIVALS ──────────────────────────────────────────────── */}
        {newArrivals.length >= 4 && (
          <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 bg-[--color-brand-card]/30">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="text-[--color-brand-muted] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Just In</span>
                <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">New Arrivals</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ── THE JOURNAL / BLOG ────────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">The Artisan Journal</span>
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Wisdom &amp; Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {journalEntries.map((entry, idx) => (
              <article key={idx} className="group cursor-pointer">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                  <Image src={entry.img} alt={entry.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="text-[--color-brand-accent] text-xs font-bold uppercase tracking-widest mb-3 block">{entry.category}</span>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] leading-snug group-hover:text-[--color-brand-accent] transition-colors">{entry.title}</h3>
              </article>
            ))}
          </div>
        </section>

        {/* ── CUSTOMER TESTIMONIALS ─────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.5fr] gap-8">
            <div className="bg-[#F8F9FE] rounded-sm p-12 flex flex-col justify-center relative overflow-hidden border border-[#EBEFFA]">
               <Quote size={120} className="absolute top-[-20px] left-[-20px] text-blue-50 opacity-50" />
               <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[#1E3A8A] mb-4 relative z-10 leading-tight">
                 See Why<br/>They Love Us
               </h2>
               <p className="text-sm font-semibold uppercase tracking-widest text-[#475569] relative z-10">Trusted By Over 11 Million Customers</p>
               <Quote size={120} className="absolute bottom-[-20px] right-[-20px] text-blue-50 opacity-50 rotate-180" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {testimonials.map((t, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[--color-brand-border] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start gap-5">
                       <Image src={t.avatar} alt={t.name} width={50} height={50} className="rounded-full object-cover shrink-0 shadow-sm border border-gray-100" />
                       <div className="flex-1">
                         <p className="text-[13px] text-gray-600 italic mb-3 leading-relaxed">"{t.text}"</p>
                         <h4 className="text-[13px] font-bold text-gray-900">- {t.name}</h4>
                         <div className="flex text-[--color-brand-accent-yellow] mt-1.5 gap-0.5">
                           {[...Array(t.rating)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                         </div>
                       </div>
                       <div className="shrink-0">
                          <Image src={t.productImg} alt="Product" width={64} height={64} className="rounded-sm object-cover border border-gray-100 shadow-sm" />
                       </div>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU ───────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {recommendedProducts.map(product => (
              <ProductCard key={`rec-${product.id}`} product={product} />
            ))}
          </div>
        </section>

        {/* ── TRUST & CREDIBILITY STRIP ─────────────────────────────────── */}
        <section className="border-t border-[--color-brand-border] bg-white py-12 mt-16">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10 divide-y md:divide-y-0 md:divide-x divide-[--color-brand-border]">
            <div className="flex items-center gap-5 flex-1 justify-center w-full">
              <Truck size={42} className="text-[#3B82F6] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">11 Million</h4>
                <p className="text-[13px] text-gray-600 font-semibold mt-0.5">Happy Deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-1 justify-center w-full pt-10 md:pt-0">
              <MapPin size={42} className="text-[#3B82F6] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">150+ Stores</h4>
                <p className="text-[13px] text-gray-600 font-semibold mt-0.5">Across 100+ Cities</p>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-1 justify-center w-full pt-10 md:pt-0">
              <RotateCcw size={42} className="text-[#3B82F6] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">7 Day Easy</h4>
                <p className="text-[13px] text-gray-600 font-semibold mt-0.5">Return Policy</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BRAND STORY SEO SECTION ───────────────────────────────────── */}
        <section className="bg-[#F8F9FA] py-16 border-t border-[#E5E7EB]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              India's Premium Destination for Authentic Handcrafted Kitchenware, Dining &amp; Traditional Home Décor
            </h2>
            <div className="text-[13px] text-gray-600 space-y-4 leading-relaxed max-w-full">
              <p>
                Welcome to KitchenBay, your one-stop shop for premium handcrafted kitchenware, fine dining essentials, and traditional Indian home décor online. Whether you are setting up an authentic traditional kitchen, seeking elegant brass and copper utensils, or decorating your home with beautiful diyas and pooja essentials, our extensive collection caters to every style. From durable cast iron cookware and traditional soapstone vessels to exquisite brass coffee dabaras and dining plates, our curated selection guarantees premium quality and unmatched longevity.
              </p>
              <p>
                Shopping for kitchenware and décor online in India has never been easier. Benefit from our seasonal mega sales, offering up to 50% off along with exclusive cashback deals and free sitewide shipping. Experience the joy of a hassle-free shopping journey backed by a 7-day easy return policy and secure payment gateways. Our expert buying guides will help you choose the right cast iron skillet, soapstone pot, or pooja essentials perfectly tailored to your home.
              </p>
              <p>
                Join over 11 million happy customers and step into a world of traditional, premium, and handcrafted living spaces today!
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
