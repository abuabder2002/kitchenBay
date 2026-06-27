'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gift,
  MessageCircle,
  ShieldCheck,
  PackageCheck,
  Headset,
  Award,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Star,
  Smile,
  Heart,
  Briefcase,
  CheckCircle2,
  Check,
  Loader2,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import EditButton from '@/components/cms/EditButton';
import CMSModal from '@/components/cms/CMSModal';

const defaultCategories = [
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

const defaultHampers = [
  {
    title: 'The Royal Wedding Hamper',
    desc: 'An exquisite collection of hand-hammered brass vessels, perfect for newlyweds.',
    img: 'https://images.unsplash.com/photo-1615486171448-4fb325087790?q=80&w=600&auto=format&fit=crop',
    price: 'Rs. 15,000'
  },
  {
    title: 'Auspicious Housewarming Set',
    desc: 'Cast iron essentials and a traditional copper water dispenser for a healthy start.',
    img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
    price: 'Rs. 8,500'
  },
  {
    title: 'Diwali Festival Collection',
    desc: 'Shimmering brass diyas and copper serveware wrapped in festive elegance.',
    img: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=600&auto=format&fit=crop',
    price: 'Rs. 5,200'
  },
  {
    title: 'Executive Corporate Gift',
    desc: 'Premium copper tumblers and personalized note in a sleek wooden box.',
    img: 'https://images.unsplash.com/photo-1544715567-0c151121d5c2?q=80&w=600&auto=format&fit=crop',
    price: 'Rs. 3,000'
  }
];

const defaultStatistics = [
  { id: '1', value: '500+', label: 'Happy Customers' },
  { id: '2', value: '1,500+', label: 'Gifts Delivered' },
  { id: '3', value: '50+', label: 'Corporate Orders' },
  { id: '4', value: '4.9/5', label: 'Average Rating' }
];

export default function GiftConciergePage() {
  const { isAdmin, currentUser, loading: authLoading } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; sectionId: string; sectionTitle: string; schema: any[]; initialData: any[] } | null>(null);

  const [categories, setCategories] = useState(defaultCategories);
  const [hampers, setHampers] = useState(defaultHampers);
  const [statistics, setStatistics] = useState(defaultStatistics);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Form Wizard States
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipient: '',
    occasion: '',
    budget: '',
    quantity: '1',
    companyName: '',
    gstNumber: '',
    specialRequirements: '',
    customerName: '',
    email: '',
    mobile: '',
    preferredContact: 'WHATSAPP' as 'WHATSAPP' | 'EMAIL' | 'PHONE'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // UI States
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Ref for auto-focusing on steps
  const formSectionRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (sectionId: string, sectionTitle: string, schema: any[], initialData: any[]) => {
    setModalConfig({ isOpen: true, sectionId, sectionTitle, schema, initialData });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEditMode(!!isAdmin);
    }
  }, [isAdmin]);

  // Sync Logged-In User Details
  useEffect(() => {
    if (!authLoading && currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || currentUser.name || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser, authLoading]);

  // Load Content from CMS API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoadingContent(true);
        const res = await fetch('/api/content?page=gift-concierge');
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            const getParsed = (key: string, fallback: any) => {
              const record = data.content.find((c: any) => c.key === key);
              if (record && record.value) {
                try { return JSON.parse(record.value); } catch(e) { return fallback; }
              }
              return fallback;
            };
            
            setCategories(getParsed('categories', defaultCategories));
            setHampers(getParsed('hampers', defaultHampers));
            setStatistics(getParsed('statistics', defaultStatistics));
          }
        }
      } catch (error) {
        console.error("Error fetching CMS content:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  // Sticky CTA Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      const formEl = document.getElementById('concierge-form');
      if (formEl) {
        const rect = formEl.getBoundingClientRect();
        // Show sticky CTA if we scroll past hero CTA (500px down) and the form is not in viewport
        const isPastHero = window.scrollY > 500;
        const isFormInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        setShowStickyCTA(isPastHero && !isFormInViewport);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const perfectFor = [
    { title: 'Weddings', value: 'wedding', icon: <Heart size={28} className="text-[#C19A6B]" /> },
    { title: 'Housewarmings', value: 'housewarming', icon: <Smile size={28} className="text-[#C19A6B]" /> },
    { title: 'Corporate Events', value: 'corporate', icon: <Briefcase size={28} className="text-[#C19A6B]" /> },
    { title: 'Festivals', value: 'festival', icon: <Sparkles size={28} className="text-[#C19A6B]" /> },
    { title: 'Return Gifting', value: 'return', icon: <Gift size={28} className="text-[#C19A6B]" /> }
  ];

  const trustCards = [
    { title: 'Handpicked Premium Gifts', desc: 'Sourced from the finest local copper and brass artisans.', icon: <Award size={32} className="text-[#556B2F]" /> },
    { title: 'Personalized Recommendations', desc: 'Every suggestion is hand-chosen by our curation experts.', icon: <Sparkles size={32} className="text-[#556B2F]" /> },
    { title: 'Secure Ordering', desc: 'Enterprise-grade payment gateway for absolute transaction safety.', icon: <ShieldCheck size={32} className="text-[#556B2F]" /> },
    { title: 'Gift Wrapping Available', desc: 'Luxury packaging featuring silk wraps and handcrafted wood boxes.', icon: <Gift size={32} className="text-[#556B2F]" /> },
    { title: 'Expert Gift Consultants', desc: 'Direct access to your dedicated gifting consultant at any time.', icon: <Headset size={32} className="text-[#556B2F]" /> },
    { title: 'Fast Delivery', desc: 'Priority express handling and shipping across major regions.', icon: <PackageCheck size={32} className="text-[#556B2F]" /> }
  ];

  const journeySteps = [
    { num: '01', title: 'Tell us about the recipient', desc: 'Tell us about the recipient and the gifting occasion.' },
    { num: '02', title: 'Share your budget and occasion', desc: 'Input your target budget, quantity, and design guidelines.' },
    { num: '03', title: 'Experts curate recommendations', desc: 'Our curators pick premium heritage items tailored for you.' },
    { num: '04', title: 'Receive personalized suggestions', desc: 'Get your customized catalog sent directly to you.' }
  ];

  const faqs = [
    {
      q: 'How does Gift Concierge work?',
      a: 'Our concierge service helps you find the perfect gift. Simply fill out our quick preference questionnaire. A dedicated gifting expert will analyze your requirements and curate a list of handcrafted, premium recommendations. You can finalize items, select premium packaging, and let us handle delivery.'
    },
    {
      q: 'Is the service free?',
      a: 'Yes, the curation and expert consultation service is entirely free of charge. You only pay for the products and premium packaging options that you choose to purchase.'
    },
    {
      q: 'Can I customize gifts?',
      a: 'Absolutely. We offer various customization options including custom brand engraving, customized cards, silk ribbon styling, and handcrafted premium wooden gift boxes.'
    },
    {
      q: 'Do you offer gift wrapping?',
      a: 'Yes, we offer multiple luxury gift wrapping experiences, including pure silk wraps, heritage block-printed handmade paper, and premium wood cases with personalized notes.'
    },
    {
      q: 'How long does it take?',
      a: 'Once you submit your inquiry, our gifting consultants will contact you within 2-4 hours with a personalized catalog. Bulk and corporate custom requests are delivered within 3-7 business days depending on location.'
    },
    {
      q: 'Can gifts be delivered directly?',
      a: 'Yes, we can ship your gifts directly to your recipients. We include customized greeting cards and premium packaging, and we ensure invoice details are withheld for direct recipient shipments.'
    }
  ];

  // Card Selection Handler
  const handleSelectCard = (field: 'recipient' | 'occasion' | 'budget', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // Hamper Click Quick Pre-fill
  const handleHamperEnquiry = (hamperTitle: string) => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: `Interested in the Featured Hamper: ${hamperTitle}`,
      quantity: '5'
    }));
    const element = document.getElementById('concierge-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ Toggle Handler
  const toggleFAQ = (idx: number) => {
    setActiveFAQ(prev => (prev === idx ? null : idx));
  };

  // Form Step Validation
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.recipient) newErrors.recipient = 'Please select a recipient category.';
      if (!formData.occasion) newErrors.occasion = 'Please select an occasion.';
    } else if (currentStep === 2) {
      if (!formData.budget) newErrors.budget = 'Please select a budget range.';
      const qty = parseInt(formData.quantity);
      if (!formData.quantity || isNaN(qty) || qty < 1) {
        newErrors.quantity = 'Please enter a valid quantity (1 or more).';
      }
    } else if (currentStep === 3) {
      if (!formData.customerName.trim()) newErrors.customerName = 'Please enter your full name.';
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.mobile.trim()) {
        newErrors.mobile = 'Please enter your phone number.';
      } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
        newErrors.mobile = 'Please enter a valid 10-digit mobile number.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation Logic
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      stepRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    stepRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Form Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Safely send data to existing /api/contact endpoint
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Gift Concierge',
          lastName: `Inquiry (${formData.customerName})`,
          email: formData.email,
          message: `
[GIFT CONCIERGE REQUEST]
----------------------------------------
Customer Name: ${formData.customerName}
Email Address: ${formData.email}
Phone Number: ${formData.mobile}
Preferred Contact: ${formData.preferredContact}

Recipient Details: ${formData.recipient}
Gifting Occasion: ${formData.occasion}
Budget per Gift: ${formData.budget}
Estimated Quantity: ${formData.quantity}
${formData.companyName ? `Company Name: ${formData.companyName}` : ''}
${formData.gstNumber ? `GSTIN: ${formData.gstNumber}` : ''}

Special Requirements / Customization:
${formData.specialRequirements || 'No special requirements specified.'}
----------------------------------------
Submitted on: ${new Date().toLocaleString('en-IN')}
          `.trim()
        })
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        setSubmissionError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setSubmissionError('Network error. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Floating Label Input Component
  const FloatingInput = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    required,
    error,
    as = 'input',
    ...props
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    error?: string;
    as?: 'input' | 'textarea';
    [key: string]: any;
  }) => {
    const [focused, setFocused] = useState(false);
    const InputComponent = as;
    const isFocusedOrFilled = focused || value;

    return (
      <div className="relative w-full mb-6">
        <InputComponent
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-5 py-4 text-base text-[--color-brand-text] bg-white border rounded-xl outline-none transition-all duration-300 ${
            error
              ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
              : 'border-[--color-brand-border] focus:border-[--color-brand-accent-yellow] focus:ring-4 focus:ring-[--color-brand-accent-yellow]/10'
          } ${as === 'textarea' ? 'pt-8 pb-3 h-32' : 'pt-6 pb-2'} peer`}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={id}
          className={`absolute left-5 text-sm font-medium transition-all duration-300 pointer-events-none select-none ${
            isFocusedOrFilled
              ? 'top-1.5 text-xs text-[--color-brand-accent-yellow]'
              : 'top-4 text-base text-[--color-brand-muted]'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && <p className="text-xs text-red-500 mt-1.5 ml-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] font-sans relative text-[--color-brand-text]">
      <Navbar />

      {/* GPU Accelerated Keyframe Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/917502777766" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Contact Gifting Expert on WhatsApp"
        className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-50 flex items-center justify-center cursor-pointer group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-4 bg-white text-[--color-brand-text] text-sm font-semibold py-2 px-4 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[--color-brand-border]">
          Gift Expert Online
        </span>
      </a>

      {/* MOBILE STICKY CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[--color-brand-border] z-40 md:hidden flex items-center justify-between shadow-2xl transition-all duration-500 transform ${
          showStickyCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[--color-brand-muted] uppercase">Free Consultation</span>
          <span className="text-sm font-bold text-[--color-brand-text]">Expert Gifting Advice</span>
        </div>
        <button 
          onClick={() => {
            const formEl = document.getElementById('concierge-form');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-5 py-2.5 bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors"
        >
          Request Curation
        </button>
      </div>

      <main>
        {/* PHASE 2 - LUXURY HERO SECTION */}
        <section className="relative bg-[#F7F2E8] py-20 md:py-32 overflow-hidden border-b border-[#E6DBC4]">
          {/* Subtle backgrounds */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C19A6B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#556B2F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 text-left animate-fade-up">
                <span className="inline-block text-[#C19A6B] text-[11px] font-bold tracking-[0.25em] uppercase mb-5 px-3 py-1.5 bg-[#C19A6B]/10 rounded-md">
                  KitchenBay Premium Services
                </span>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#4A3B32] mb-6 leading-[1.15] tracking-tight">
                  Find the Perfect Gift <br />Without the Stress
                </h1>
                
                <p className="text-base sm:text-lg text-[--color-brand-muted] max-w-xl mb-8 leading-relaxed font-light">
                  Our gifting experts curate thoughtful, handcrafted heritage gifts based on your recipient, budget, and occasion. Experience a luxury gifting service tailored to perfection.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                  <a 
                    id="hero-cta-btn"
                    href="#concierge-form" 
                    className="w-full sm:w-auto text-center px-8 py-4 bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 tracking-wider uppercase text-xs focus:ring-4 focus:ring-[#556B2F]/20 outline-none"
                  >
                    Request Gift Curation
                  </a>
                  <a 
                    href="https://wa.me/917502777766" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full sm:w-auto text-center px-8 py-4 bg-white text-[#4A3B32] border border-[--color-brand-border] font-bold rounded-xl hover:bg-[#F0EAD6]/30 transition-all duration-300 tracking-wider uppercase text-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} className="text-[#25D366]" />
                    WhatsApp Expert
                  </a>
                </div>

                {/* Hero Badges */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[--color-brand-border] pt-6 text-sm text-[--color-brand-muted]">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-[#C19A6B] fill-[#C19A6B]" />
                    <span className="font-semibold text-[--color-brand-text]">4.9/5 Rating</span>
                    <span>by 1,500+ buyers</span>
                  </div>
                  <span className="hidden sm:inline text-[--color-brand-border]">•</span>
                  <div className="flex items-center gap-1.5">
                    <Award size={16} className="text-[#556B2F]" />
                    <span>100% Handcrafted Indian Artistry</span>
                  </div>
                </div>
              </div>

              {/* Hero Right Graphic */}
              <div className="lg:col-span-5 relative animate-scale-in delay-100">
                <div className="relative h-[320px] sm:h-[420px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                  <Image 
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" 
                    alt="Premium Luxury Gifting Presentation" 
                    fill 
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                    <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mb-1 block">The Art of Giving</span>
                    <h3 className="text-xl font-serif font-bold">Heritage Packaging</h3>
                    <p className="text-xs text-white/80 font-light mt-0.5">Handcrafted boxes paired with authentic Indian textiles.</p>
                  </div>
                </div>
                {/* Decorative floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-[#F0EAD6] border border-[#E6DBC4] p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-accent)] flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-[--color-brand-muted] uppercase font-bold tracking-wider">Free Curation</p>
                    <p className="text-sm font-bold text-[--color-brand-text]">Expert Assistance</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION - STATISTICS */}
        <section className="relative z-20 -mt-10 mx-4 sm:mx-8 lg:mx-auto max-w-6xl bg-white border border-[--color-brand-border] shadow-xl rounded-2xl py-6 px-4 md:px-8">
          {isEditMode && <EditButton onClick={() => handleEditClick('statistics', 'Statistics', [
            { key: 'value', label: 'Statistic Value' },
            { key: 'label', label: 'Statistic Label' },
            { key: 'id', label: 'Statistic ID' }
          ], statistics)} label="Edit Statistics" />}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[--color-brand-border]/60">
            {statistics.map((stat, idx) => {
              const Icon = [Smile, Gift, Briefcase, Star][idx % 4];
              return (
                <div key={stat.id || idx} className="first:border-none px-2 py-3 flex flex-col items-center">
                  <Icon size={24} className="text-[#C19A6B] mb-2" />
                  <h4 className="text-2xl sm:text-3xl font-bold font-serif text-[--color-brand-text]">{stat.value}</h4>
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-[--color-brand-muted] uppercase mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PHASE 3 - HOW IT WORKS */}
        <section className="py-20 bg-white border-b border-[--color-brand-border]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Seamless Process</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[--color-brand-text]">How It Works</h2>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {journeySteps.map((step, idx) => {
                const Icon = [Heart, Sliders, Sparkles, Gift][idx];
                return (
                  <div 
                    key={idx} 
                    className="bg-[#F7F2E8] border border-[--color-brand-border] p-8 rounded-2xl relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* Step Number Badge */}
                      <span className="absolute top-4 right-6 text-5xl font-serif font-bold text-[#C19A6B]/15 select-none transition-colors group-hover:text-[#C19A6B]/35">
                        {step.num}
                      </span>
                      {/* Icon */}
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-6 border border-[--color-brand-border] text-[#556B2F] group-hover:bg-[#556B2F] group-hover:text-white transition-all duration-300">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-lg font-serif font-bold text-[--color-brand-text] mb-3">{step.title}</h3>
                      <p className="text-sm text-[--color-brand-muted] leading-relaxed">{step.desc}</p>
                    </div>
                    {/* Visual bottom indicator */}
                    <div className="w-8 h-1 bg-transparent group-hover:bg-[#C19A6B] mt-6 transition-all duration-300 rounded-full"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PHASE 8 - PREMIUM UI (COLLECTIONS REDESIGN) */}
        <section id="collections" className="py-20 bg-[#F7F2E8] relative">
          {isEditMode && <EditButton onClick={() => handleEditClick('categories', 'Gifting Collections', [
            { key: 'title', label: 'Title' },
            { key: 'desc', label: 'Description' },
            { key: 'img', label: 'Image URL', type: 'image' },
            { key: 'id', label: 'Category ID' }
          ], categories)} label="Edit Collections" />}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Masterfully Crafted</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[--color-brand-text]">Curated Gifting Collections</h2>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>

            {isLoadingContent ? (
              // Skeleton Loaders
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm h-96 border border-[--color-brand-border]">
                    <div className="h-60 bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      handleSelectCard('occasion', cat.id);
                      const element = document.getElementById('concierge-form');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-[--color-brand-border] flex flex-col h-full"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <Image 
                        src={cat.img} 
                        alt={cat.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300"></div>
                    </div>
                    <div className="p-6 text-center flex-1 flex flex-col justify-between border-t border-[--color-brand-border]/30">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[--color-brand-text] mb-2 group-hover:text-[#556B2F] transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-[--color-brand-muted] leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                      <span className="text-xs text-[#556B2F] font-bold uppercase tracking-wider mt-4 inline-flex items-center justify-center gap-1">
                        Select Option <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION - FEATURED HAMPERS */}
        <section className="py-20 bg-white border-y border-[--color-brand-border]">
          {isEditMode && <EditButton onClick={() => handleEditClick('hampers', 'Featured Hampers', [
            { key: 'title', label: 'Title' },
            { key: 'desc', label: 'Description' },
            { key: 'price', label: 'Price' },
            { key: 'img', label: 'Image URL', type: 'image' }
          ], hampers)} label="Edit Hampers" />}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Premium Gifting</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[--color-brand-text]">Signature Gift Hampers</h2>
              </div>
              <button 
                onClick={() => handleHamperEnquiry('Signature Gift Hampers')}
                className="inline-flex items-center gap-1.5 text-xs text-[#556B2F] hover:text-[#4A5D23] font-bold uppercase tracking-wider hover:underline"
              >
                Customize a Hamper <ChevronRight size={16} />
              </button>
            </div>

            {isLoadingContent ? (
              // Hamper Skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white border border-[--color-brand-border] rounded-2xl h-96 overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {hampers.map((hamper, idx) => (
                  <div key={idx} className="bg-[#F7F2E8] rounded-2xl border border-[--color-brand-border] overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <img 
                        src={hamper.img} 
                        alt={hamper.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-white border border-[--color-brand-border] px-3 py-1 rounded-full text-xs font-bold text-[--color-brand-text] shadow-sm">
                        {hamper.price}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="text-lg font-serif font-bold text-[--color-brand-text] mb-1.5 line-clamp-1">{hamper.title}</h3>
                        <p className="text-xs text-[--color-brand-muted] leading-relaxed line-clamp-3">{hamper.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleHamperEnquiry(hamper.title)}
                        className="w-full py-2.5 bg-white border border-[--color-brand-border] text-[#556B2F] hover:bg-[#556B2F] hover:text-white transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION - WHO IS THIS PERFECT FOR? */}
        <section className="py-20 bg-[#F7F2E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Occasion Directory</span>
              <h2 className="text-3xl font-serif font-bold text-[--color-brand-text]">Who Is This Perfect For?</h2>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {perfectFor.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    handleSelectCard('occasion', item.value);
                    const formEl = document.getElementById('concierge-form');
                    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[--color-brand-border] w-40 sm:w-44 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
                >
                  <div className="w-12 h-12 bg-[#F7F2E8] group-hover:bg-[#556B2F] group-hover:text-white rounded-full flex items-center justify-center mb-4 transition-all duration-300 text-[#556B2F] shadow-inner">
                    {item.icon}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[--color-brand-text] text-center">{item.title}</h4>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PHASE 4 - PREMIUM FORM REDESIGN */}
        <section ref={formSectionRef} id="concierge-form" className="py-20 bg-white border-y border-[--color-brand-border] relative">
          <div ref={stepRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-28">
            
            <div className="mb-12">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Bespeak Consultation</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[--color-brand-text] mb-3">Begin Your Gifting Inquiry</h2>
              <p className="text-sm text-[--color-brand-muted] max-w-lg mx-auto">
                Share details with our curators to receive a tailored digital catalog of handcrafted Indian heritage gifts.
              </p>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>

            {/* FORM CARD */}
            <div className="bg-[#F7F2E8] border border-[--color-brand-border] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden text-left">
              
              {/* Progress Indicator */}
              <div className="mb-10" aria-label="Form Progress">
                <div className="flex items-center justify-between text-xs text-[--color-brand-muted] font-bold tracking-wider uppercase mb-3">
                  <span>Step {step} of 3</span>
                  <span>{step === 1 ? 'Occasion & Recipient' : step === 2 ? 'Details & Budget' : 'Contact & Submission'}</span>
                </div>
                <div className="w-full bg-[#E6DBC4] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#556B2F] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(step / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {isSubmitted ? (
                /* Success Screen */
                <div className="py-8 flex flex-col items-center text-center animate-fade-up">
                  <div className="w-20 h-20 bg-[#556B2F] rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-[#556B2F]/20 animate-bounce">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[--color-brand-text] mb-3">Inquiry Submitted Successfully</h3>
                  <p className="text-sm text-[--color-brand-muted] max-w-md mb-8 leading-relaxed">
                    Thank you, <strong>{formData.customerName}</strong>! Our master curators are reviewing your details. A personalized heritage gifting catalog will be sent to <strong>{formData.email}</strong> or via <strong>{formData.preferredContact}</strong> within 2-4 hours.
                  </p>
                  <button 
                    onClick={() => {
                      setStep(1);
                      setIsSubmitted(false);
                      setFormData({
                        recipient: '',
                        occasion: '',
                        budget: '',
                        quantity: '1',
                        companyName: '',
                        gstNumber: '',
                        specialRequirements: '',
                        customerName: currentUser?.name || '',
                        email: currentUser?.email || '',
                        mobile: '',
                        preferredContact: 'WHATSAPP'
                      });
                    }}
                    className="px-8 py-3 bg-[#556B2F] hover:bg-[#4A5D23] text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  
                  {/* Step 1: Occasion & Recipient */}
                  {step === 1 && (
                    <div className="space-y-6 animate-fade-up">
                      
                      {/* Recipient Field */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[--color-brand-text] mb-3 flex items-center gap-1.5">
                          <span>1. Who is the recipient?</span>
                          <span className="text-red-500">*</span>
                        </h4>
                        
                        {errors.recipient && (
                          <p className="text-xs text-red-500 mb-3" role="alert">{errors.recipient}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { value: 'family', title: 'Family & Friends', desc: 'Personal celebrations' },
                            { value: 'clients', title: 'Corporate Clients', desc: 'Business partnerships' },
                            { value: 'employees', title: 'Employees / Staff', desc: 'Team celebrations' },
                            { value: 'guests', title: 'Wedding Guests', desc: 'Favors & return gifts' },
                            { value: 'other', title: 'Other Category', desc: 'Bespoke curations' }
                          ].map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => handleSelectCard('recipient', opt.value)}
                              className={`p-4 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] ${
                                formData.recipient === opt.value
                                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/10'
                                  : 'border-[#E6DBC4] bg-white hover:border-[#C19A6B]'
                              }`}
                            >
                              <p className="text-sm font-bold text-[--color-brand-text]">{opt.title}</p>
                              <p className="text-[11px] text-[--color-brand-muted] mt-1">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Occasion Field */}
                      <div className="pt-4 border-t border-[--color-brand-border]/60">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[--color-brand-text] mb-3 flex items-center gap-1.5">
                          <span>2. What is the occasion?</span>
                          <span className="text-red-500">*</span>
                        </h4>
                        
                        {errors.occasion && (
                          <p className="text-xs text-red-500 mb-3" role="alert">{errors.occasion}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { value: 'wedding', title: 'Wedding Ceremonies', desc: 'Auspicious sets & brassware' },
                            { value: 'housewarming', title: 'Housewarmings', desc: 'Cookware & cast iron' },
                            { value: 'festival', title: 'Diwali & Festivals', desc: 'Diyas & serveware' },
                            { value: 'corporate', title: 'Corporate Gifting', desc: 'Branded executive items' },
                            { value: 'return', title: 'Return Gifting', desc: 'Meaningful bulk details' },
                            { value: 'other', title: 'Other Celebration', desc: 'Bespoke curations' }
                          ].map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => handleSelectCard('occasion', opt.value)}
                              className={`p-4 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] ${
                                formData.occasion === opt.value
                                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/10'
                                  : 'border-[#E6DBC4] bg-white hover:border-[#C19A6B]'
                              }`}
                            >
                              <p className="text-sm font-bold text-[--color-brand-text]">{opt.title}</p>
                              <p className="text-[11px] text-[--color-brand-muted] mt-1">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Step 2: Details & Budget */}
                  {step === 2 && (
                    <div className="space-y-6 animate-fade-up">
                      
                      {/* Budget Range Field */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[--color-brand-text] mb-3 flex items-center gap-1.5">
                          <span>3. Budget per Gift</span>
                          <span className="text-red-500">*</span>
                        </h4>

                        {errors.budget && (
                          <p className="text-xs text-red-500 mb-3" role="alert">{errors.budget}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { value: 'under-2000', title: 'Under Rs. 2,000', desc: 'Artisanal copper & tableware' },
                            { value: '2000-5000', title: 'Rs. 2,000 - Rs. 5,000', desc: 'Heritage pots, pans & brass sets' },
                            { value: '5000-10000', title: 'Rs. 5,000 - Rs. 10,000', desc: 'Royal hampers & master vessels' },
                            { value: 'above-10000', title: 'Above Rs. 10,000', desc: 'Bespoke corporate & bridal packages' }
                          ].map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => handleSelectCard('budget', opt.value)}
                              className={`p-4 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] ${
                                formData.budget === opt.value
                                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/10'
                                  : 'border-[#E6DBC4] bg-white hover:border-[#C19A6B]'
                              }`}
                            >
                              <p className="text-sm font-bold text-[--color-brand-text]">{opt.title}</p>
                              <p className="text-[11px] text-[--color-brand-muted] mt-1">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="pt-4 border-t border-[--color-brand-border]/60">
                        <FloatingInput
                          id="quantity"
                          label="Estimated Quantity Needed"
                          type="number"
                          min="1"
                          required
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          error={errors.quantity}
                        />
                      </div>

                      {/* Conditional Corporate Fields */}
                      {(formData.recipient === 'clients' || formData.recipient === 'employees' || formData.occasion === 'corporate') && (
                        <div className="pt-4 border-t border-[--color-brand-border]/60 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
                          <FloatingInput
                            id="companyName"
                            label="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          />
                          <FloatingInput
                            id="gstNumber"
                            label="GSTIN (Optional)"
                            maxLength={15}
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                          />
                        </div>
                      )}

                      {/* Special Requirements Textarea */}
                      <div className="pt-4 border-t border-[--color-brand-border]/60">
                        <FloatingInput
                          id="specialRequirements"
                          label="Customization or Packaging Preferences (e.g. laser branding, silk wraps)"
                          as="textarea"
                          value={formData.specialRequirements}
                          onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                        />
                      </div>

                    </div>
                  )}

                  {/* Step 3: Contact & Submission */}
                  {step === 3 && (
                    <div className="space-y-6 animate-fade-up">
                      
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[--color-brand-text] mb-4">
                        4. Contact Details
                      </h4>

                      {submissionError && (
                        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2" role="alert">
                          <span>⚠</span>
                          <p>{submissionError}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput
                          id="customerName"
                          label="Your Full Name"
                          required
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          error={errors.customerName}
                          autoFocus
                        />
                        <FloatingInput
                          id="email"
                          label="Email Address"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          error={errors.email}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FloatingInput
                          id="mobile"
                          label="Phone Number (10 digit)"
                          type="tel"
                          required
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          error={errors.mobile}
                        />
                        
                        {/* Preferred Contact Method */}
                        <div>
                          <label className="block text-xs font-semibold tracking-wider text-[--color-brand-muted] uppercase mb-2">
                            Preferred Contact Method
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'WHATSAPP', label: 'WhatsApp' },
                              { value: 'EMAIL', label: 'Email' },
                              { value: 'PHONE', label: 'Call' }
                            ].map((opt) => (
                              <button
                                type="button"
                                key={opt.value}
                                onClick={() => setFormData({ ...formData, preferredContact: opt.value as any })}
                                className={`py-3 px-2 rounded-xl text-xs font-bold text-center border focus:outline-none transition-all ${
                                  formData.preferredContact === opt.value
                                    ? 'border-[#556B2F] bg-[#556B2F]/5 text-[#556B2F]'
                                    : 'border-[#E6DBC4] bg-white hover:border-[#C19A6B]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[--color-brand-border]/60 flex items-center justify-between text-xs text-[--color-brand-muted] gap-3">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={14} className="text-[#556B2F]" /> No obligations
                        </span>
                        <span className="flex items-center gap-1">
                          <Check size={14} className="text-[#556B2F]" /> Free digital catalog
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-[#556B2F]" /> Secure processing
                        </span>
                      </div>

                    </div>
                  )}

                  {/* Actions Container */}
                  <div className="flex items-center justify-between pt-6 border-t border-[--color-brand-border] gap-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 bg-white border border-[--color-brand-border] hover:bg-[#F0EAD6]/30 text-[--color-brand-text] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors outline-none"
                      >
                        Back
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3.5 bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 outline-none"
                      >
                        Continue <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3.5 bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 outline-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          'Submit Gifting Request'
                        )}
                      </button>
                    )}
                  </div>

                </form>
              )}

            </div>
          </div>
        </section>

        {/* PHASE 5 - TRUST SECTION */}
        <section className="py-20 bg-[#F7F2E8] border-b border-[--color-brand-border]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">KitchenBay Standards</span>
              <h2 className="text-3xl font-serif font-bold text-[--color-brand-text]">Our Gifting Guarantees</h2>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trustCards.map((trust, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-2xl border border-[--color-brand-border] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 group"
                >
                  <div className="p-3 bg-[#F7F2E8] rounded-xl text-[#556B2F] shrink-0 transition-colors group-hover:bg-[#556B2F] group-hover:text-white">
                    {trust.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[--color-brand-text] mb-1.5">{trust.title}</h3>
                    <p className="text-xs text-[--color-brand-muted] leading-relaxed">{trust.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PHASE 6 - SOCIAL PROOF */}
        <section className="py-20 bg-white border-b border-[--color-brand-border]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Score Card */}
              <div className="lg:col-span-4 bg-[#F7F2E8] border border-[--color-brand-border] p-8 rounded-3xl text-center shadow-inner">
                <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mb-1 block">Customer Index</span>
                <p className="text-5xl font-serif font-bold text-[--color-brand-text] mb-2">4.9/5</p>
                <div className="flex justify-center gap-1 mb-4 text-[#C19A6B]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={20} className="fill-[#C19A6B]" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-[--color-brand-text]">92.7% Satisfaction Rate</p>
                <p className="text-xs text-[--color-brand-muted] mt-1">Based on 1,500+ verified orders</p>
                
                <div className="border-t border-[--color-brand-border]/60 mt-6 pt-6 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-lg font-bold text-[--color-brand-text]">1,500+</p>
                    <p className="text-[9px] font-bold text-[--color-brand-muted] uppercase tracking-wider">Gifts Delivered</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[--color-brand-text]">50+</p>
                    <p className="text-[9px] font-bold text-[--color-brand-muted] uppercase tracking-wider">Corporate Leads</p>
                  </div>
                </div>
              </div>

              {/* Right Testimonials */}
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="mb-6">
                  <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-1">Real Reviews</span>
                  <h3 className="text-2xl font-serif font-bold text-[--color-brand-text]">What Our Patrons Say</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: 'Aditi Rao',
                      role: 'HR Director at TechCorp',
                      quote: 'We ordered 150 corporate gift sets for Diwali. The hand-engraved copper tumblers were stunning, and the wooden boxes looked extremely expensive. Our clients were absolutely wowed!'
                    },
                    {
                      name: 'Suresh Kumar',
                      role: 'Delhi Resident',
                      quote: 'Choosing return gifts for 200 wedding guests was stress-free. The concierge helped us select beautiful traditional brass diyas, wrapped them in pure silk, and delivered directly to the venue.'
                    }
                  ].map((review, i) => (
                    <div key={i} className="bg-[#F7F2E8]/40 border border-[--color-brand-border] p-6 rounded-2xl relative">
                      <div className="flex gap-0.5 text-[#C19A6B] mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className="fill-[#C19A6B]" />
                        ))}
                      </div>
                      <p className="text-xs text-[--color-brand-muted] italic leading-relaxed mb-4">
                        "{review.quote}"
                      </p>
                      <div>
                        <p className="text-xs font-bold text-[--color-brand-text]">{review.name}</p>
                        <p className="text-[10px] text-[--color-brand-muted] mt-0.5">{review.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION - PREMIUM PACKAGING PREVIEW */}
        <section className="py-20 bg-[var(--color-brand-top-bar)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Content */}
              <div className="text-left">
                <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Presentation</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
                  Premium Packaging <br />Options
                </h2>
                <p className="text-white/80 text-sm mb-8 leading-relaxed font-light">
                  A gift's first impression is just as important as what's inside. We offer luxury packaging experiences including handcrafted teak wood boxes, hand-block printed cotton wraps, pure silk ribbons, and custom engraved brass tags.
                </p>
                
                <ul className="space-y-4 mb-10 text-sm">
                  {[
                    'Sustainable & Eco-friendly organic packaging',
                    'Custom laser logo engraving for corporate requests',
                    'Bespoke handwritten wax-sealed cards',
                    'Impact-resistant internal cushioning for safe transit'
                  ].map((li, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-brand-accent)] flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </span>
                      <span className="text-white/90">{li}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="#concierge-form" 
                  className="inline-block px-6 py-3.5 bg-white text-[var(--color-brand-top-bar)] hover:bg-[#F7F2E8] font-bold rounded-xl transition-all uppercase tracking-wider text-xs shadow-md"
                >
                  Request Packaging Info
                </a>
              </div>
              
              {/* Right Images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-60 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" 
                      alt="Luxury Box Wrapper packaging" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=400&auto=format&fit=crop" 
                      alt="Eco-friendly packaging" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1544715567-0c151121d5c2?q=80&w=400&auto=format&fit=crop" 
                      alt="Corporate packaging details" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="relative h-60 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop" 
                      alt="Traditional box wraps" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PHASE 7 - ELEGANT FAQ ACCORDION */}
        <section className="py-20 bg-white border-b border-[--color-brand-border]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[#C19A6B] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Common Questions</span>
              <h2 className="text-3xl font-serif font-bold text-[--color-brand-text]">Frequently Asked Questions</h2>
              <div className="w-16 h-0.5 bg-[#C19A6B] mx-auto mt-4"></div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFAQ === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-[--color-brand-border] rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFAQ(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleFAQ(idx);
                        }
                      }}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] bg-[var(--color-brand-bg)] hover:brightness-95 transition-colors"
                    >
                      <span className="font-serif font-bold text-sm sm:text-base text-[--color-brand-text]">
                        {faq.q}
                      </span>
                      <ChevronDown 
                        size={18} 
                        className={`text-[--color-brand-muted] transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`} 
                      />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-52 border-t border-[--color-brand-border]/60 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-6 bg-white text-xs sm:text-sm text-[--color-brand-muted] leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

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
          pageName="gift-concierge"
        />
      )}
    </div>
  );
}
