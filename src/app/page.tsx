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
import { Truck, RotateCcw, ShieldCheck, HeartHandshake, Leaf, Users, Star, Quote, MapPin, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import JsonLd from '@/components/seo/JsonLd';
import { faqPageSchema } from '@/lib/schemas';
import { useProducts } from '@/lib/productsContext';
import { useAuth } from '@/lib/authContext';
import EditButton from '@/components/cms/EditButton';
import dynamic from 'next/dynamic';

const CMSModal = dynamic(() => import('@/components/cms/CMSModal'), { ssr: false });

const defaultCategories = [
  { name: 'Kitchenware', sub: 'Traditional Cookware', img: '/images/marketing/modern_world_kitchen.png' },
  { name: 'Dining', sub: 'Handcrafted Serveware', img: '/images/home/modern_luxury_dining_card.png' },
  { name: 'Décor', sub: 'Heritage Home Accents', img: '/images/home/modern_luxury_decor_card.png' },
];

const defaultMaterials = [
  { name: 'Cast Iron', desc: 'Naturally non-stick & iron fortifying', img: '/images/home/material_cast_iron.png' },
  { name: 'Pure Brass', desc: 'Timeless elegance & health benefits', img: '/images/home/material_pure_brass.png' },
  { name: 'Copper', desc: 'Ayurvedic wellness for water storage', img: '/images/home/material_copper.png' },
  { name: 'Soapstone', desc: 'Slow cooking for perfect flavor', img: '/images/home/material_soapstone.png' }
];

const defaultJournalEntries = [
  { title: 'The Lost Art of Hand-Hammered Cookware', category: 'Craftsmanship', img: '/artisan_hammering_copper.png' },
  { title: 'Why Traditional Brass Adds Positive Energy', category: 'Heritage', img: '/artisan_crafting_brass.png' },
  { title: 'Seasoning Your Cast Iron: A Masterclass', category: 'Care Guide', img: '/artisan_forging_cast_iron.png' }
];

const defaultTestimonials = [
  { name: "Michelle Rose", text: "I absolutely love this Triply Cookware set! Cooked my first traditional curry in it, and the heat distribution is amazing.", rating: 5, avatar: "https://i.pravatar.cc/150?img=1", productImg: "/artisan_kitchenware.png" },
  { name: "Paras Chugh", text: "The Soapstone Cookware is outstanding. Authentic taste and retains heat for a very long time. Extremely pleased!", rating: 5, avatar: "https://i.pravatar.cc/150?img=11", productImg: "/artisan_crafting_brass.png" },
  { name: "Prabhas Upadhyay", text: "Brought this beautiful Brass Coffee Dabara set. It's solid brass and gives the perfect filter coffee feel.", rating: 5, avatar: "https://i.pravatar.cc/150?img=33", productImg: "/artisan_hammering_copper.png" },
  { name: "Jayavant Jadhav", text: "These traditional brass diyas are of exceptional quality. They look stunning during pooja ceremonies!", rating: 5, avatar: "https://i.pravatar.cc/150?img=60", productImg: "/artisan_forging_cast_iron.png" },
];

const defaultPromoSlides = [
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

const defaultMainHeroBanner = [
  {
    title: "Authentic Handcrafted Kitchenware",
    image: "/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg",
    link: "/products",
  }
];

const defaultSecondaryBanners = [
  { title: "Modern Kitchen Collection →", image: "/images/home/handi-set-banner-wide.png", link: "/products?category=kitchenware" },
  { title: "Premium Dining & Serveware →", image: "/images/home/durable-cookware-banner-wide.png", link: "/products?category=dining" },
  { title: "Bring Style Into Everyday Living →", image: "/images/home/apple-handi-banner-wide.png", link: "/products?category=decor" }
];

const defaultHeritage = [
  {
    title: 'Reviving Ancient Kitchen Wisdom',
    paragraph1: 'We journey to traditional clusters across India, from the Kansa makers of West Bengal to the cast-iron Kitchenbays of Tamil Nadu. By bringing their authentic, handcrafted cookware directly to your home, we help preserve generational skills that modern manufacturing has left behind.',
    paragraph2: 'Every utensil is forged with purpose—designed not just to cook food, but to nourish the body according to timeless Ayurvedic principles.',
    image: '/artisan_kitchenware.png'
  }
];

const homeFaqs = [
  { question: "What makes KitchenBay's cast iron cookware special?", answer: "Our cast iron cookware is pre-seasoned naturally without any chemical coatings. It is handcrafted by traditional artisans from Tamil Nadu, ensuring excellent heat retention, durability, and iron-fortified food." },
  { question: "Do you deliver all over India?", answer: "Yes, KitchenBay delivers to over 20,000+ pincodes across India with standard delivery taking 5-7 business days." },
  { question: "Are your brass and copper utensils safe for daily use?", answer: "Absolutely. Our brass and copper utensils are made from pure, food-grade materials and are safe for traditional cooking and water storage when cared for properly." },
  { question: "What is your return policy?", answer: "We offer a hassle-free 48-hour return policy in case of any transit damage or manufacturing defects. Just contact our support team." }
];

export default function HomePage() {
  const [homeProducts, setHomeProducts] = useState<any[]>([]);
  const { isAdmin, currentUser } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showWelcomeOffer, setShowWelcomeOffer] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const shown = localStorage.getItem(`welcomeOfferShown_${currentUser.id}`);
      if (!shown) {
        const timer = setTimeout(() => {
          setShowWelcomeOffer(true);
          localStorage.setItem(`welcomeOfferShown_${currentUser.id}`, 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; sectionId: string; sectionTitle: string; schema: any[]; initialData: any[] } | null>(null);

  const handleEditClick = (sectionId: string, sectionTitle: string, schema: any[], initialData: any[]) => {
    setModalConfig({ isOpen: true, sectionId, sectionTitle, schema, initialData });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEditMode(!!isAdmin);
    }
  }, [isAdmin]);

  const [mainHeroBanner, setMainHeroBanner] = useState(defaultMainHeroBanner);
  const [secondaryBanners, setSecondaryBanners] = useState(defaultSecondaryBanners);
  const [promoSlides, setPromoSlides] = useState(defaultPromoSlides);
  const [categories, setCategories] = useState(defaultCategories);
  const [materials, setMaterials] = useState(defaultMaterials);
  const [journalEntries, setJournalEntries] = useState(defaultJournalEntries);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [heritage, setHeritage] = useState(defaultHeritage);
  const [manualBestsellers, setManualBestsellers] = useState<{ productId: string }[]>([]);
  const [manualNewArrivals, setManualNewArrivals] = useState<{ productId: string }[]>([]);
  const [manualRecommended, setManualRecommended] = useState<{ productId: string }[]>([]);

  useEffect(() => {
    // Fetch CMS content and products in sequence
    const fetchContentAndProducts = async () => {
      try {
        let bestsellersList: any[] = [];
        let newArrivalsList: any[] = [];
        let recommendedList: any[] = [];

        const res = await fetch('/api/content?page=home');
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            const getParsed = (key: string, fallback: any) => {
              const record = data.content.find((c: any) => c.key === key);
              if (record && record.value) {
                try { return JSON.parse(record.value); } catch (e) { return fallback; }
              }
              return fallback;
            };

            setMainHeroBanner(getParsed('mainHeroBanner', defaultMainHeroBanner));
            setSecondaryBanners(getParsed('secondaryBanners', defaultSecondaryBanners));
            setPromoSlides(getParsed('promoSlides', defaultPromoSlides));
            setCategories(getParsed('categories', defaultCategories));
            setMaterials(getParsed('materials', defaultMaterials));
            setJournalEntries(getParsed('journalEntries', defaultJournalEntries));
            setTestimonials(getParsed('testimonials', defaultTestimonials));
            setHeritage(getParsed('heritage', defaultHeritage));
            
            bestsellersList = getParsed('bestsellers', []);
            newArrivalsList = getParsed('newArrivals', []);
            recommendedList = getParsed('recommended', []);

            setManualBestsellers(bestsellersList);
            setManualNewArrivals(newArrivalsList);
            setManualRecommended(recommendedList);
          }
        }

        // Collect configured product IDs to perform a single batch query
        const idsSet = new Set<string>();
        [...bestsellersList, ...newArrivalsList, ...recommendedList].forEach(item => {
          if (item && item.productId) {
            const id = item.productId.split('/').pop();
            if (id) idsSet.add(id);
          }
        });

        let productsUrl = '/api/products?limit=16';
        if (idsSet.size > 0) {
          productsUrl = `/api/products?ids=${Array.from(idsSet).join(',')}`;
        }

        const prodRes = await fetch(productsUrl);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData)) {
            setHomeProducts(prodData);
          }
        }
      } catch (error) {
        console.error("Error fetching CMS content & products:", error);
      }
    };
    fetchContentAndProducts();
  }, []);

  useEffect(() => {
    if (promoSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

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

  const bestsellers = useMemo(() => {
    if (manualBestsellers.length > 0) {
      const validProducts = manualBestsellers.map(m => homeProducts.find(p => `/products/${p.id}` === m.productId)).filter(Boolean) as any[];
      if (validProducts.length > 0) return validProducts;
    }
    return homeProducts.slice(0, 4);
  }, [homeProducts, manualBestsellers]);

  const newArrivals = useMemo(() => {
    if (manualNewArrivals.length > 0) {
      const validProducts = manualNewArrivals.map(m => homeProducts.find(p => `/products/${p.id}` === m.productId)).filter(Boolean) as any[];
      if (validProducts.length > 0) return validProducts;
    }
    return homeProducts.slice(4, 8);
  }, [homeProducts, manualNewArrivals]);

  const recommendedProducts = useMemo(() => {
    if (manualRecommended.length > 0) {
      const validProducts = manualRecommended.map(m => homeProducts.find(p => `/products/${p.id}` === m.productId)).filter(Boolean) as any[];
      if (validProducts.length > 0) return validProducts;
    }
    return [...homeProducts].reverse().slice(0, 8);
  }, [homeProducts, manualRecommended]);

  const activePromoSlides = promoSlides && promoSlides.length > 0 ? promoSlides : defaultPromoSlides;
  const activeSecondaryBanners = secondaryBanners && secondaryBanners.length > 0 ? secondaryBanners : defaultSecondaryBanners;
  const activeCategories = categories && categories.length > 0 ? categories : defaultCategories;
  const activeMaterials = materials && materials.length > 0 ? materials : defaultMaterials;
  const activeJournalEntries = journalEntries && journalEntries.length > 0 ? journalEntries : defaultJournalEntries;
  const activeTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;
  const activeHeritage = heritage && heritage.length > 0 ? heritage : defaultHeritage;

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <JsonLd data={faqPageSchema(homeFaqs)} />
      <main className="flex-1">

        {/* ── NEW HERO SECTION (Banner Grid) ────────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1600px] mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Left Main Banner (Summer Sale) */}
              <div className="lg:col-span-8 relative w-full h-[300px] sm:h-[400px] md:h-[500px] group overflow-hidden block">
                {isEditMode && <EditButton onClick={() => handleEditClick('mainHeroBanner', 'Main Hero Banner', [
                  { key: 'title', label: 'Title' },
                  { key: 'image', label: 'Image URL', type: 'image' },
                  { key: 'link', label: 'Link URL', type: 'product-link' }
                ], mainHeroBanner)} label="Edit Main Banner" />}
                {mainHeroBanner.map((banner, idx) => (
                  <Link key={idx} href={banner.link || '/products'} className="absolute inset-0 z-0">
                    <Image
                      src={banner.image || "/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg"}
                      alt={banner.title || "Collection for Everyday Cooking"}
                      fill
                      priority={true}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
                    <div className="absolute inset-0 z-0 flex flex-col justify-center items-center text-center p-6 sm:p-8 lg:p-12 pointer-events-none">
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{banner.title}</h2>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                      <span className="bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors mt-4 inline-block shadow-sm">Explore Collection</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Side Banner (Premium Slideshow) */}
              <div className="lg:col-span-4 relative w-full h-[300px] sm:h-[400px] md:h-[500px] group overflow-hidden block bg-slate-900" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {isEditMode && <EditButton onClick={() => handleEditClick('promoSlides', 'Hero Banners', [
                  { key: 'title', label: 'Title' },
                  { key: 'subtitle', label: 'Subtitle' },
                  { key: 'image', label: 'Image URL', type: 'image' },
                  { key: 'link', label: 'Link URL', type: 'product-link' }
                ], activePromoSlides)} label="Edit Slides" />}
                {activePromoSlides.map((slide, idx) => (
                  <Link
                    key={idx}
                    href={slide.link || '#'}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                  >
                    <Image
                      src={slide.image || '/images/marketing/everyday_cooking.jpg'}
                      alt={slide.title || 'Slide Image'}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className={`object-contain object-center transition-transform duration-[4000ms] ease-out ${idx === currentSlide ? 'scale-105' : 'scale-100'
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
                  {activePromoSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/80'
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
                <span className="text-sm md:text-base font-bold text-gray-800">500+ Happy Deliveries</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-3 py-2 md:py-0">
                <Users className="text-gray-600" size={28} />
                <span className="text-sm md:text-base font-bold text-gray-800">Premium Kitchenware Collection</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-3 py-2 md:py-0">
                <RotateCcw className="text-gray-600" size={28} />
                <span className="text-sm md:text-base font-bold text-gray-800">48-Hour Easy Return Policy</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FULL WIDTH PROMO BAR ──────────────────────────────────────── */}
        <section className="bg-[#E8F5E9] text-black py-4 relative">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-xl sm:text-2xl italic font-[family-name:var(--font-heading)] font-medium">Now Serving:</span>
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold">Get Upto Rs.100 Off On Your First Order</span>
            </div>
            <Link href="/login" className="flex items-center gap-2 text-lg font-bold border-b border-black transition-all duration-300 ease-in-out hover:text-gray-700 hover:border-gray-700 hover:scale-105">
              Sign Up Now <span className="text-xl">&gt;</span>
            </Link>
          </div>
        </section>

        {/* ── 3 CATEGORY BANNERS ────────────────────────────────────────── */}
        <section className="bg-white py-6 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('secondaryBanners', 'Secondary Banners', [
            { key: 'title', label: 'Title' },
            { key: 'image', label: 'Image URL', type: 'image' },
            { key: 'link', label: 'Link URL', type: 'product-link' }
          ], activeSecondaryBanners)} label="Edit Secondary Banners" />}
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSecondaryBanners.slice(0, 3).map((banner, idx) => {
                const isDark = idx === 1;
                return (
                  <Link key={idx} href={banner.link || '/products'} className="relative w-full aspect-[2.5/1] md:aspect-[2/1] overflow-hidden group/banner rounded-sm block bg-slate-100">
                    <Image
                      src={banner.image || '/images/marketing/everyday_cooking.jpg'}
                      alt={banner.title || 'Banner Image'}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover/banner:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-black/80 via-black/40' : 'from-white/90 via-white/40'} to-transparent`} />
                    <div className="absolute top-0 left-0 h-full flex flex-col justify-center p-6 md:p-8 max-w-[60%]">
                      <h4 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-tight`}>{banner.title}</h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CATEGORY SHOWCASE ─────────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('categories', 'Categories', [
            { key: 'name', label: 'Name' },
            { key: 'sub', label: 'Subtitle' },
            { key: 'img', label: 'Image', type: 'image' }
          ], activeCategories)} label="Edit Categories" />}
          <div className="text-center mb-16">
            <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Curated Categories</span>
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Discover Our Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {activeCategories.map((cat, idx) => (
              <Link href={`/products?category=${cat.name.toLowerCase()}`} key={idx} className="group flex flex-col items-center cursor-pointer">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm mb-6 shadow-sm">
                  <Image
                    src={cat.img || '/images/marketing/everyday_cooking.jpg'}
                    alt={cat.name || 'Category Image'}
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

        {/* ── Kitchenbay STORY SECTION ─────────────────────────────────────── */}
        <section className="bg-[--color-brand-top-bar] text-[--color-brand-bg] py-24 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('heritage', 'Our Heritage', [
            { key: 'title', label: 'Title' },
            { key: 'paragraph1', label: 'Paragraph 1', type: 'textarea' },
            { key: 'paragraph2', label: 'Paragraph 2', type: 'textarea' },
            { key: 'image', label: 'Image URL', type: 'image' }
          ], heritage)} label="Edit Our Heritage" />}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 lg:pr-12">
                <span className="text-[--color-brand-accent-yellow] text-sm font-semibold tracking-[0.2em] uppercase mb-6 block">Our Heritage</span>
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-8 leading-tight">
                  {activeHeritage[0]?.title}
                </h2>
                <p className="text-lg text-[--color-brand-bg]/80 mb-6 leading-relaxed">
                  {activeHeritage[0]?.paragraph1}
                </p>
                <p className="text-lg text-[--color-brand-bg]/80 mb-10 leading-relaxed">
                  {activeHeritage[0]?.paragraph2}
                </p>
                <Link href="/story" className="inline-block border-b-2 border-[--color-brand-accent-yellow] pb-1 text-sm font-bold uppercase tracking-widest hover:text-[--color-brand-accent-yellow] transition-colors">
                  Read Our Story
                </Link>
              </div>
              <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto lg:max-w-none">
                <Image
                  src={activeHeritage[0]?.image || '/artisan_kitchenware.png'}
                  alt="Traditional Indian handcrafted kitchenware"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover rounded-t-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── TRADITION VIDEO SECTION ────────────────────────────────────── */}
        <TraditionVideoSection />

        {/* ── BESTSELLERS ───────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('bestsellers', 'Bestsellers', [
            { key: 'productId', label: 'Select Product', type: 'product-link' }
          ], manualBestsellers)} label="Edit Bestsellers" />}
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
        <section className="bg-white py-24 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('materials', 'Materials', [
            { key: 'name', label: 'Name' },
            { key: 'desc', label: 'Description' },
            { key: 'img', label: 'Image', type: 'image' }
          ], activeMaterials)} label="Edit Materials" />}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">The Essence of Earth</h2>
              <p className="text-[--color-brand-muted] mt-4 max-w-2xl mx-auto">Explore our range categorized by the timeless, natural materials that form their foundation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeMaterials.map((mat, idx) => (
                <Link href={`/products?material=${mat.name}`} key={idx} className="group relative w-full h-[400px] overflow-hidden rounded-sm cursor-pointer">
                  <Image src={mat.img || '/images/marketing/everyday_cooking.jpg'} alt={mat.name || 'Material Image'} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
          <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 bg-[--color-brand-card]/30 relative group">
            {isEditMode && <EditButton onClick={() => handleEditClick('newArrivals', 'New Arrivals', [
              { key: 'productId', label: 'Select Product', type: 'product-link' }
            ], manualNewArrivals)} label="Edit New Arrivals" />}
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
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('journalEntries', 'Journal', [
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'img', label: 'Image', type: 'image' }
          ], activeJournalEntries)} label="Edit Journal" />}
          <div className="text-center mb-16">
            <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">The Kitchenbay Journal</span>
            <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Wisdom &amp; Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {activeJournalEntries.map((entry, idx) => (
              <article key={idx} className="group cursor-pointer">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                  <Image src={entry.img || '/images/marketing/everyday_cooking.jpg'} alt={entry.title || 'Journal Image'} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="text-[--color-brand-accent] text-xs font-bold uppercase tracking-widest mb-3 block">{entry.category}</span>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] leading-snug group-hover:text-[--color-brand-accent] transition-colors">{entry.title}</h3>
              </article>
            ))}
          </div>
        </section>

        {/* ── CUSTOMER TESTIMONIALS ─────────────────────────────────────── */}
        <section className="py-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('testimonials', 'Testimonials', [
            { key: 'name', label: 'Name' },
            { key: 'text', label: 'Review Text' },
            { key: 'rating', label: 'Rating (1-5)', type: 'number' },
            { key: 'avatar', label: 'Avatar Image', type: 'image' },
            { key: 'productImg', label: 'Product Image', type: 'image' }
          ], activeTestimonials)} label="Edit Testimonials" />}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.5fr] gap-8">
            <div className="bg-[#F8F9FE] rounded-sm p-12 flex flex-col justify-center relative overflow-hidden border border-[#EBEFFA]">
              <Quote size={120} className="absolute top-[-20px] left-[-20px] text-blue-50 opacity-50" />
              <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[#1E3A8A] mb-4 relative z-10 leading-tight">
                See Why<br />They Love Us
              </h2>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#475569] relative z-10">Trusted By Over 500+ Happy Customers</p>
              <Quote size={120} className="absolute bottom-[-20px] right-[-20px] text-blue-50 opacity-50 rotate-180" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTestimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[--color-brand-border] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-5">
                    <Image src={t.avatar || 'https://i.pravatar.cc/150'} alt={t.name || 'Avatar'} width={50} height={50} className="rounded-full object-cover shrink-0 shadow-sm border border-gray-100" />
                    <div className="flex-1">
                      <p className="text-[13px] text-gray-600 italic mb-3 leading-relaxed">"{t.text}"</p>
                      <h4 className="text-[13px] font-bold text-gray-900">- {t.name}</h4>
                      <div className="flex text-[--color-brand-accent-yellow] mt-1.5 gap-0.5">
                        {[...Array(t.rating)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Image src={t.productImg || '/images/marketing/everyday_cooking.jpg'} alt="Product" width={64} height={64} className="rounded-sm object-cover border border-gray-100 shadow-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU ───────────────────────────────────────── */}
        <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
          {isEditMode && <EditButton onClick={() => handleEditClick('recommended', 'Recommended For You', [
            { key: 'productId', label: 'Select Product', type: 'product-link' }
          ], manualRecommended)} label="Edit Recommended" />}
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
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">500+</h4>
                <p className="text-[13px] text-gray-600 font-semibold mt-0.5">Happy Deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-1 justify-center w-full pt-10 md:pt-0">
              <RotateCcw size={42} className="text-[#3B82F6] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-extrabold text-[15px] text-gray-900 leading-tight">48-Hour Easy Return Policy</h4>
                <p className="text-[13px] text-gray-600 font-semibold mt-0.5">Return Policy</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── POPULAR SEARCHES (Internal Linking for SEO) ───────────────── */}
        <section className="border-t border-[--color-brand-border] bg-white py-12">
          <div className="max-w-[1600px] mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-6 font-[family-name:var(--font-heading)] uppercase tracking-widest">Popular Searches</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Cast Iron Skillet', link: '/products?category=kitchenware' },
                { name: 'Pure Brass Kadai', link: '/products?category=kitchenware' },
                { name: 'Copper Water Bottle', link: '/products?category=dining' },
                { name: 'Soapstone Kalchatti', link: '/products?category=kitchenware' },
                { name: 'Triply Stainless Steel', link: '/products?category=kitchenware' },
                { name: 'Brass Pooja Items', link: '/products?category=decor' },
                { name: 'Traditional South Indian Coffee Maker', link: '/products?category=dining' },
                { name: 'Hand-hammered Copper Jug', link: '/products?category=dining' },
              ].map((item, i) => (
                <Link key={i} href={item.link} className="text-sm text-gray-600 bg-gray-100 hover:bg-[--color-brand-accent] hover:text-white px-4 py-2 rounded-full transition-colors border border-gray-200 shadow-sm">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ────────────────────────────────── */}
        <section className="bg-gray-50 py-16 border-t border-[--color-brand-border]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {homeFaqs.map((faq, idx) => (
                <details key={idx} className="group bg-white border border-gray-200 rounded-sm shadow-sm [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-5 font-bold text-gray-900 cursor-pointer">
                    {faq.question}
                    <ChevronDown size={18} className="text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                </details>
              ))}
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
                Shopping for kitchenware and décor online in India has never been easier. Benefit from our seasonal mega sales, offering up to 50% off along with exclusive cashback deals and free shipping above Rs. 2000. Experience the joy of a hassle-free shopping journey backed by a 48-hour easy return policy and secure payment gateways. Our expert buying guides will help you choose the right cast iron skillet, soapstone pot, or pooja essentials perfectly tailored to your home.
              </p>
              <p>
                Join over 500+ happy customers and step into a world of traditional, premium, and handcrafted living spaces today!
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* WELCOME OFFER MODAL */}
      {showWelcomeOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full relative animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowWelcomeOffer(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-white/50 rounded-full p-1 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <div className="relative h-48 w-full bg-[#E8F5E9]">
              <Image src="/images/home/WhatsApp Image 2026-05-31 at 11.37.08 AM.jpeg" alt="Welcome Offer" fill sizes="(max-width: 480px) 100vw, 448px" className="object-cover opacity-80 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">Welcome to KitchenBay!</h3>
              </div>
            </div>
            <div className="p-8 text-center">
              <span className="inline-block bg-[#F5E6C8] text-[#4A3B18] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">First Order Exclusive</span>
              <p className="text-xl font-bold text-gray-900 mb-2">Get Rs. 100 Off Your First Purchase</p>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                As a thank you for joining our community, a Rs. 100 discount has been automatically unlocked for your account. It will be seamlessly deducted at checkout!
              </p>
              <button 
                onClick={() => setShowWelcomeOffer(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-widest text-sm"
              >
                Start Shopping Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* CMS Modals */}
      {modalConfig && (
        <CMSModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(null)}
          onSaveSuccess={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
          sectionId={modalConfig.sectionId}
          sectionTitle={modalConfig.sectionTitle}
          initialData={modalConfig.initialData}
          schema={modalConfig.schema}
        />
      )}
    </div>
  );
}
