'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */


import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gift,
  MessageCircle,
  Mail,
  ShieldCheck,
  PackageCheck,
  Headset,
  Award,
  ChevronRight,
  Sparkles,
  Star,
  Gem,
  Smile,
  Heart,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export default function GiftConciergePage() {
  const [finderState, setFinderState] = useState({
    occasion: '',
    budget: '',
    quantity: ''
  });

  const categories = [
    {
      id: 'wedding',
      title: 'Wedding Gifts',
      desc: 'Timeless handcrafted vessels for the perfect beginning.',
      img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'housewarming',
      title: 'Housewarming Gifts',
      desc: 'Heritage cookware to bless a new kitchen and home.',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'festival',
      title: 'Festival Gifts',
      desc: 'Auspicious brass and copper items for festive joy.',
      img: 'https://images.unsplash.com/photo-1605389659020-f5e93345e69e?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'corporate',
      title: 'Corporate Gifting',
      desc: 'Premium Kitchenbay gifts for clients and employees.',
      img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'return',
      title: 'Return Gifts',
      desc: 'Meaningful handcrafted tokens for your guests.',
      img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'heritage',
      title: 'Premium Heritage',
      desc: 'Luxury traditional heirlooms meant to last generations.',
      img: 'https://images.unsplash.com/photo-1603566164673-8a3c874bc0b3?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const hampers = [
    {
      title: 'The Royal Wedding Hamper',
      desc: 'An exquisite collection of hand-hammered brass vessels, perfect for newlyweds.',
      img: 'https://images.unsplash.com/photo-1615486171448-4fb325087790?q=80&w=600&auto=format&fit=crop',
      price: '₹15,000'
    },
    {
      title: 'Auspicious Housewarming Set',
      desc: 'Cast iron essentials and a traditional copper water dispenser for a healthy start.',
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
      price: '₹8,500'
    },
    {
      title: 'Diwali Festival Collection',
      desc: 'Shimmering brass diyas and copper serveware wrapped in festive elegance.',
      img: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=600&auto=format&fit=crop',
      price: '₹5,200'
    },
    {
      title: 'Executive Corporate Gift',
      desc: 'Premium copper tumblers and personalized note in a sleek wooden box.',
      img: 'https://images.unsplash.com/photo-1544715567-0c151121d5c2?q=80&w=600&auto=format&fit=crop',
      price: '₹3,000'
    }
  ];

  const perfectFor = [
    { title: 'Weddings', icon: <Heart size={32} className="mb-4 text-[--color-brand-accent-yellow]" /> },
    { title: 'Housewarming', icon: <img src="/icons/home.svg" alt="" className="w-8 h-8 mb-4 opacity-70 filter sepia" /> }, // Fallback to gem if svg missing
    { title: 'Corporate Events', icon: <Briefcase size={32} className="mb-4 text-[--color-brand-accent-yellow]" /> },
    { title: 'Festivals', icon: <Sparkles size={32} className="mb-4 text-[--color-brand-accent-yellow]" /> },
    { title: 'Return Gifts', icon: <Gift size={32} className="mb-4 text-[--color-brand-accent-yellow]" /> }
  ];

  const features = [
    { title: 'Handcrafted by Kitchenbays', icon: <Star size={24} />, desc: 'Authentic techniques passed down through generations.' },
    { title: 'Heritage Inspired', icon: <Gem size={24} />, desc: 'Products deeply rooted in traditional Indian culture.' },
    { title: 'Premium Packaging', icon: <PackageCheck size={24} />, desc: 'Elegant and secure unboxing experience for every gift.' },
    { title: 'Personalized Recommendations', icon: <Sparkles size={24} />, desc: 'Curated specifically for your occasion and budget.' },
    { title: 'Dedicated Assistance', icon: <Headset size={24} />, desc: 'One-on-one expert help throughout your gifting journey.' },
    { title: 'Trusted Quality', icon: <ShieldCheck size={24} />, desc: 'Rigorous quality checks for exceptional durability.' }
  ];

  const journeySteps = [
    { num: '01', title: 'Share Requirement', desc: 'Tell us about the occasion, your budget, and the recipients.' },
    { num: '02', title: 'Get Curated Suggestions', desc: 'Our experts handpick the finest heritage products for you.' },
    { num: '03', title: 'Confirm Selection', desc: 'Finalize your choice with optional premium packaging.' },
    { num: '04', title: 'Delivery & Celebration', desc: 'We deliver safely to your doorstep, ready for the occasion.' }
  ];

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <Navbar />

      {/* FLOATING WHATSAPP BUTTON */}
      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-50 flex items-center justify-center cursor-pointer group">
        <MessageCircle size={32} className="group-hover:animate-bounce" />
        <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-bold py-2 px-4 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Gift Expert Online
        </span>
      </a>

      <main>
        {/* SECTION 1 - HERO */}
        <section className="relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white py-32 md:py-48 overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1615486171448-4fb325087790?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay transform group-hover:scale-105 transition-transform duration-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/80 via-transparent to-transparent"></div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <span className="inline-block text-blue-200 text-sm font-bold tracking-[0.2em] uppercase mb-6 border border-blue-300/40 px-5 py-2 rounded-full backdrop-blur-md shadow-sm">
              Kitchenbay Gifting
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-[family-name:var(--font-heading)] mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              Meaningful Gifts for<br />Every Occasion
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Discover handcrafted gifts for weddings, housewarming ceremonies, festivals, corporate gifting, return gifts, and special celebrations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <a href="#collections" className="w-full sm:w-auto px-10 py-4 bg-white text-[#1E3A8A] font-bold rounded-sm hover:bg-blue-50 hover:shadow-xl transition-all duration-300 tracking-wide uppercase text-sm">
                Explore Gift Collections
              </a>
              <a href="#concierge" className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/60 text-white font-bold rounded-sm hover:bg-white/10 transition-all duration-300 tracking-wide uppercase text-sm">
                Talk to a Gift Expert
              </a>
            </div>
          </div>
        </section>

        {/* SECTION - STATISTICS */}
        <section className="py-8 sm:py-12 bg-white border border-[#BFDBFE] shadow-md relative z-20 -mt-10 mx-4 sm:mx-8 lg:mx-auto max-w-[1400px] rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center group p-2 sm:p-4">
              <Smile size={32} className="mx-auto text-[--color-brand-accent-yellow] mb-3 group-hover:scale-125 transition-transform duration-300" />
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-1">15,000+</h4>
              <p className="text-[--color-brand-muted] text-[11px] uppercase tracking-[0.15em] font-bold">Happy Customers</p>
            </div>
            <div className="text-center group p-2 sm:p-4 border-l border-gray-100 sm:border-none md:border-l">
              <Gift size={32} className="mx-auto text-[--color-brand-accent-yellow] mb-3 group-hover:scale-125 transition-transform duration-300" />
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-1">50,000+</h4>
              <p className="text-[--color-brand-muted] text-[11px] uppercase tracking-[0.15em] font-bold">Gifts Delivered</p>
            </div>
            <div className="text-center group p-2 sm:p-4 md:border-l md:border-gray-100">
              <Briefcase size={32} className="mx-auto text-[--color-brand-accent-yellow] mb-3 group-hover:scale-125 transition-transform duration-300" />
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-1">1,200+</h4>
              <p className="text-[--color-brand-muted] text-[11px] uppercase tracking-[0.15em] font-bold">Corporate Orders</p>
            </div>
            <div className="text-center group p-2 sm:p-4 border-l border-gray-100 sm:border-none md:border-l">
              <Star size={32} className="mx-auto text-[--color-brand-accent-yellow] mb-3 group-hover:scale-125 transition-transform duration-300" />
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-1">99.8%</h4>
              <p className="text-[--color-brand-muted] text-[11px] uppercase tracking-[0.15em] font-bold">Satisfaction Rate</p>
            </div>
          </div>
        </section>

        {/* SECTION 2 - GIFTING CATEGORIES */}
        <section id="collections" className="pt-32 pb-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 bg-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">Curated Gifting Collections</h2>
            <div className="w-24 h-1 bg-[--color-brand-accent-yellow] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map(cat => (
              <div key={cat.id} className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 border border-[--color-brand-border] hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden">
                  <Image src={cat.img} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-8 text-center relative bg-white border-t-4 border-transparent group-hover:border-[--color-brand-accent-yellow] transition-colors duration-300">
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-3 group-hover:text-[--color-brand-accent-yellow] transition-colors">{cat.title}</h3>
                  <p className="text-[--color-brand-muted] text-sm leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION - FEATURED HAMPERS */}
        <section className="py-24 bg-[#E6F2FF] relative overflow-hidden border-y border-[#BFDBFE]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BFDBFE]/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-[--color-brand-accent-yellow] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Signature Collection</span>
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Featured Gift Hampers</h2>
              </div>
              <a href="#concierge" className="inline-flex items-center gap-2 text-[--color-brand-text] font-bold uppercase tracking-wider text-sm hover:text-[--color-brand-accent-yellow] transition-colors group">
                Customize a Hamper <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {hampers.map((hamper, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-64 overflow-hidden">
                    <img src={hamper.img} alt={hamper.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[--color-brand-text]">
                      {hamper.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-2">{hamper.title}</h3>
                    <p className="text-[--color-brand-muted] text-sm line-clamp-2">{hamper.desc}</p>
                    <button className="mt-6 w-full py-3 border border-[--color-brand-text] text-[--color-brand-text] font-bold text-xs uppercase tracking-widest rounded hover:bg-[--color-brand-text] hover:text-white transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION - WHO IS THIS PERFECT FOR? */}
        <section className="py-24 bg-[#EFF6FF]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">Who Is This Perfect For?</h2>
              <div className="w-24 h-1 bg-[--color-brand-accent-yellow] mx-auto mb-8"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {perfectFor.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-[--color-brand-border] w-48 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
                  {item.icon}
                  <h4 className="font-bold text-[--color-brand-text] text-center">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION - PREMIUM PACKAGING PREVIEW */}
        <section className="py-24 bg-[#1E3A8A] text-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-200 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">The Presentation</span>
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6 leading-tight">
                  Premium Packaging <br />Preview
                </h2>
                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                  A gift's first impression is just as important as what's inside. We offer luxury packaging options including handcrafted wooden boxes, pure silk wrapping, and custom-engraved brass nameplates.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Sustainable & Eco-friendly materials', 'Custom brand logos for corporate orders', 'Personalized handwritten heritage notes', 'Secure cushioning for safe transit'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-blue-100">
                      <CheckCircle2 className="text-blue-300 shrink-0" size={20} />
                      {li}
                    </li>
                  ))}
                </ul>
                <a href="#concierge" className="inline-block px-8 py-4 bg-white text-[#1E3A8A] font-bold rounded hover:bg-blue-50 transition-colors uppercase tracking-wider text-sm shadow-md">
                  Request Packaging Catalog
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" alt="Packaging 1" className="w-full h-64 object-cover rounded-xl" />
                  <img src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=400&auto=format&fit=crop" alt="Packaging 2" className="w-full h-48 object-cover rounded-xl" />
                </div>
                <div className="space-y-4 sm:pt-12">
                  <img src="https://images.unsplash.com/photo-1544715567-0c151121d5c2?q=80&w=400&auto=format&fit=crop" alt="Packaging 3" className="w-full h-48 object-cover rounded-xl" />
                  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop" alt="Packaging 4" className="w-full h-64 object-cover rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - GIFT FINDER */}
        <section className="py-24 bg-white border-b border-[#BFDBFE]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Gift size={48} className="mx-auto text-[--color-brand-accent-yellow] mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">The Gift Finder</h2>
            <p className="text-[--color-brand-muted] mb-12 text-lg">Let us help you find the perfect match for your requirements.</p>

            <div className="bg-[#EFF6FF] p-8 md:p-12 rounded-2xl shadow-xl border border-[#BFDBFE]">

              <div className="mb-10 text-left">
                <label className="block text-[--color-brand-text] font-bold uppercase tracking-widest text-sm mb-4">Step 1: Choose Occasion</label>
                <div className="flex flex-wrap gap-3">
                  {['Wedding', 'Housewarming', 'Festival', 'Corporate', 'Return Gift'].map(occ => (
                    <button
                      key={occ}
                      onClick={() => setFinderState(p => ({ ...p, occasion: occ }))}
                      className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${finderState.occasion === occ ? 'bg-[--color-brand-accent] text-white border-[--color-brand-accent] shadow-md scale-105' : 'bg-white text-[--color-brand-text] border-[--color-brand-border] hover:border-[--color-brand-accent] hover:shadow-sm'}`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10 text-left">
                <label className="block text-[--color-brand-text] font-bold uppercase tracking-widest text-sm mb-4">Step 2: Choose Budget (Per Gift)</label>
                <div className="flex flex-wrap gap-3">
                  {['₹500–1000', '₹1000–2500', '₹2500–5000', 'Premium'].map(bud => (
                    <button
                      key={bud}
                      onClick={() => setFinderState(p => ({ ...p, budget: bud }))}
                      className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${finderState.budget === bud ? 'bg-[--color-brand-accent] text-white border-[--color-brand-accent] shadow-md scale-105' : 'bg-white text-[--color-brand-text] border-[--color-brand-border] hover:border-[--color-brand-accent] hover:shadow-sm'}`}
                    >
                      {bud}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-12 text-left">
                <label className="block text-[--color-brand-text] font-bold uppercase tracking-widest text-sm mb-4">Step 3: Choose Quantity</label>
                <div className="flex flex-wrap gap-3">
                  {['10+', '50+', '100+', '500+'].map(qty => (
                    <button
                      key={qty}
                      onClick={() => setFinderState(p => ({ ...p, quantity: qty }))}
                      className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${finderState.quantity === qty ? 'bg-[--color-brand-accent] text-white border-[--color-brand-accent] shadow-md scale-105' : 'bg-white text-[--color-brand-text] border-[--color-brand-border] hover:border-[--color-brand-accent] hover:shadow-sm'}`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full md:w-auto px-12 py-5 bg-[--color-brand-text] text-white font-bold tracking-[0.15em] uppercase text-sm rounded hover:bg-[--color-brand-accent] transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:-translate-y-1">
                Get Personalized Recommendations <ChevronRight size={20} />
              </button>

            </div>
          </div>
        </section>

        {/* SECTION 4 - WHY CHOOSE KITCHENBAY GIFTS */}
        <section className="py-24 bg-[#E6F2FF] max-w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">Why Choose Kitchenbay Gifts</h2>
              <div className="w-24 h-1 bg-[--color-brand-accent-yellow] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feat, idx) => (
                <div key={idx} className="bg-white p-10 rounded-xl border border-[#BFDBFE] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#2563EB] group-hover:text-white">
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-4">{feat.title}</h3>
                  <p className="text-[--color-brand-muted] leading-relaxed text-lg">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 - GIFTING JOURNEY */}
        <section className="py-32 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-20 text-white">The Gifting Journey</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-white/20"></div>

              {journeySteps.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white text-[#1E3A8A] rounded-full flex items-center justify-center text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 shadow-[0_0_0_8px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_0_12px_rgba(255,255,255,0.2)] transition-all duration-300">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-blue-100 text-base max-w-[250px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 - GIFT CONCIERGE */}
        <section id="concierge" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
          <div className="bg-white rounded-3xl p-12 md:p-20 text-center shadow-2xl border border-[#BFDBFE] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6F2FF] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BFDBFE]/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10">
              <Headset size={64} className="mx-auto text-[#2563EB] mb-8" />
              <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-heading)] text-[#1E3A8A] mb-6">
                Need Help Choosing the Perfect Gift?
              </h2>
              <p className="text-xl text-[--color-brand-muted] max-w-3xl mx-auto mb-12 leading-relaxed">
                Our gifting experts will help you choose the right products based on occasion, budget, and quantity. Let us handle the details while you take the credit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-5 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#1DA851] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg">
                  <MessageCircle size={24} />
                  WhatsApp Gift Expert
                </a>
                <a href="mailto:gifting@kitchenbay.com" className="w-full sm:w-auto px-10 py-5 bg-white text-[--color-brand-text] font-bold rounded-lg border border-[--color-brand-border] hover:bg-gray-50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-lg">
                  <Mail size={24} />
                  Email Gift Expert
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 - TRUST SECTION */}
        <section className="py-20 bg-[#EFF6FF] border-t border-[#BFDBFE]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-10 md:gap-20">
              {[
                { icon: <Award size={36} />, label: 'Premium Quality' },
                { icon: <PackageCheck size={36} />, label: 'Secure Packaging' },
                { icon: <Headset size={36} />, label: 'Dedicated Support' },
                { icon: <Gem size={36} />, label: 'Heritage Craftsmanship' }
              ].map((trust, i) => (
                <div key={i} className="flex items-center gap-4 text-[--color-brand-text] group">
                  <div className="text-[--color-brand-accent-yellow] group-hover:scale-110 transition-transform duration-300">{trust.icon}</div>
                  <span className="font-bold text-sm tracking-[0.15em] uppercase text-gray-500 group-hover:text-[--color-brand-text] transition-colors">{trust.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
