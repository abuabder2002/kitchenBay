'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, HeartHandshake, Leaf, Users, Star, Quote, MapPin } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useAuth } from '@/lib/authContext';

const categories = [
  { name: 'Kitchenware', sub: 'Traditional Cookware', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Dining', sub: 'Handcrafted Serveware', img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop' },
  { name: 'Décor', sub: 'Heritage Home Accents', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
];

const materials = [
  { name: 'Cast Iron', desc: 'Naturally non-stick & iron fortifying', img: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=400&auto=format&fit=crop' },
  { name: 'Pure Brass', desc: 'Timeless elegance & health benefits', img: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=400&auto=format&fit=crop' },
  { name: 'Copper', desc: 'Ayurvedic wellness for water storage', img: 'https://images.unsplash.com/photo-1615486171448-4fb325087790?q=80&w=400&auto=format&fit=crop' },
  { name: 'Soapstone', desc: 'Slow cooking for perfect flavor', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400&auto=format&fit=crop' }
];

const journalEntries = [
  { title: 'The Lost Art of Hand-Hammered Cookware', category: 'Craftsmanship', img: '/artisan_making_cookware.png' },
  { title: 'Why Traditional Brass Adds Positive Energy', category: 'Heritage', img: '/journal_brass_energy.png' },
  { title: 'Seasoning Your Cast Iron: A Masterclass', category: 'Care Guide', img: '/journal_cast_iron.png' }
];

export default function HomePage() {
  const { products } = useProducts();
  const { isAdmin } = useAuth();

  const bestsellers = useMemo(() => products.slice(0, 4), [products]);
  const newArrivals = useMemo(() => products.slice(4, 8), [products]);
  const recommendedProducts = useMemo(() => [...products].reverse().slice(0, 8), [products]);

  const testimonials = [
    { name: "Michelle Rose", text: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1", productImg: "https://images.unsplash.com/photo-1596489357597-9e325145df0f?q=80&w=200&auto=format&fit=crop" },
    { name: "Paras Chugh", text: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!", rating: 5, avatar: "https://i.pravatar.cc/150?img=11", productImg: "https://images.unsplash.com/photo-1584347576595-5c12852936de?q=80&w=200&auto=format&fit=crop" },
    { name: "Prabhas Upadhyay", text: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.", rating: 5, avatar: "https://i.pravatar.cc/150?img=33", productImg: "https://images.unsplash.com/photo-1615486171448-4fb325087790?q=80&w=200&auto=format&fit=crop" },
    { name: "Jayavant Jadhav", text: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!", rating: 5, avatar: "https://i.pravatar.cc/150?img=60", productImg: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=200&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1">

        {/* ── HERO SECTION (Full Width) ─────────────────────────────────── */}
        <section className="relative w-full h-[85vh] min-h-[600px] bg-black">
          <Image
            src="/artisan_kitchenware_hero.png"
            alt="Authentic Indian Kitchenware"
            fill
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-[--color-brand-accent-yellow] text-sm md:text-base font-semibold tracking-[0.3em] uppercase mb-6">
              Handcrafted Indian Kitchenware
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-heading)] text-white max-w-4xl leading-tight mb-8">
              Reviving Culinary Wisdom For The Modern Kitchen
            </h1>
            <Link href="/products" className="bg-[--color-brand-bg] text-[--color-brand-text] hover:bg-[--color-brand-accent-yellow] hover:text-white px-10 py-4 text-sm font-semibold uppercase tracking-widest transition-all duration-300 rounded-sm">
              Explore The Collection
            </Link>
          </div>
        </section>

        {/* ── WHY CHOOSE US STRIP ───────────────────────────────────────── */}
        <section className="border-b border-[--color-brand-border] bg-white py-12">
          <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-around gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[--color-brand-border]">
            <div className="flex flex-col items-center gap-4 flex-1 px-4">
              <Users className="text-[--color-brand-accent]" size={32} />
              <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Fair Trade</h4>
              <p className="text-sm text-[--color-brand-muted]">Empowering 500+ rural artisans directly.</p>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1 px-4 pt-8 md:pt-0">
              <Leaf className="text-[--color-brand-accent]" size={32} />
              <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Sustainable</h4>
              <p className="text-sm text-[--color-brand-muted]">100% natural, eco-friendly materials.</p>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1 px-4 pt-8 md:pt-0">
              <ShieldCheck className="text-[--color-brand-accent]" size={32} />
              <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Lab Tested</h4>
              <p className="text-sm text-[--color-brand-muted]">Certified for purity and food safety.</p>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1 px-4 pt-8 md:pt-0">
              <RotateCcw className="text-[--color-brand-accent]" size={32} />
              <h4 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Heritage</h4>
              <p className="text-sm text-[--color-brand-muted]">Crafting methods passed down for generations.</p>
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
                <span className="text-[--color-brand-accent-yellow] text-sm font-semibold tracking-[0.2em] uppercase mb-6 block">Our Impact</span>
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-8 leading-tight">
                  Reviving Forgotten Crafts &amp; Empowering Hands
                </h2>
                <p className="text-lg text-[--color-brand-bg]/80 mb-6 leading-relaxed">
                  We travel to the deepest corners of India to collaborate with traditional craft clusters. By bringing their authentic creations directly to you, we eliminate middlemen and ensure these master artisans receive fair value for their generational skills.
                </p>
                <p className="text-lg text-[--color-brand-bg]/80 mb-10 leading-relaxed">
                  Every product tells a story of heritage, patience, and a deep connection to the earth.
                </p>
                <Link href="/story" className="inline-block border-b-2 border-[--color-brand-accent-yellow] pb-1 text-sm font-bold uppercase tracking-widest hover:text-[--color-brand-accent-yellow] transition-colors">
                  Read Our Story
                </Link>
              </div>
              <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto lg:max-w-none">
                <Image
                  src="https://images.unsplash.com/photo-1520625399580-bfae3489e217?q=80&w=800&auto=format&fit=crop"
                  alt="Artisan at work"
                  fill
                  className="object-cover rounded-t-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

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
