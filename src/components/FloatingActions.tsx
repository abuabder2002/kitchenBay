'use client';
// Force compile to clear HMR hydration cache

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageCircle } from 'lucide-react';

// ─── Feature 1: Scroll-to-top button with animated circular progress ring ─────
function ScrollToTopButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circle math
  const size = 52;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`relative group flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
      }`}
    >
      {/* Progress ring SVG */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90 transition-all duration-300"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="white"
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#0333B9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-200"
        />
      </svg>
      {/* Inner icon */}
      <div className="relative z-10 w-9 h-9 bg-[#231F20] group-hover:bg-[#0333B9] rounded-full flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
        <ArrowUp size={18} className="text-white group-hover:-translate-y-0.5 transition-transform duration-300" />
      </div>
    </button>
  );
}

// ─── Feature 2: WhatsApp floating contact button ───────────────────────────────
function WhatsAppButton() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    // Stop pulsing after 6 seconds to not be annoying
    const timer = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link
      href="https://wa.me/917502777766?text=Hi%20KitchenBay!%20I%20need%20help."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="relative group flex items-center justify-center"
    >
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
      )}
      <div className="relative w-[52px] h-[52px] bg-[#25D366] hover:bg-[#1da851] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
        {/* WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.004 3C9.374 3 4 8.373 4 15.003c0 2.18.588 4.22 1.617 5.98L4 29l8.218-1.576A12.96 12.96 0 0016.004 28C22.63 28 28 22.627 28 16.003 28 9.374 22.63 3 16.004 3zm0 23.54a10.97 10.97 0 01-5.583-1.523l-.4-.238-4.877.937.988-4.759-.261-.42A10.897 10.897 0 015.06 15.003C5.06 8.97 9.97 4.06 16.004 4.06c6.033 0 10.937 4.91 10.937 10.943 0 6.034-4.904 10.937-10.937 10.937zm6.007-8.192c-.329-.165-1.942-.958-2.243-1.067-.301-.11-.52-.165-.738.165-.22.33-.849 1.067-1.041 1.286-.192.22-.384.247-.712.083-.33-.165-1.39-.513-2.648-1.633-.978-.874-1.637-1.953-1.83-2.283-.191-.33-.02-.508.144-.673.148-.148.33-.385.494-.576.165-.192.22-.33.33-.549.11-.22.055-.412-.027-.577-.083-.165-.739-1.779-1.013-2.437-.265-.638-.539-.55-.739-.56l-.63-.011a1.21 1.21 0 00-.876.412c-.302.33-1.15 1.124-1.15 2.74 0 1.615 1.178 3.175 1.342 3.394.165.22 2.314 3.534 5.607 4.954.784.338 1.395.54 1.872.692.787.25 1.503.214 2.069.13.632-.094 1.943-.794 2.217-1.56.274-.768.274-1.426.191-1.563-.082-.137-.302-.22-.631-.385z"/>
        </svg>
      </div>
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
        Chat with us!
      </span>
    </Link>
  );
}

// ─── Feature 3: Sticky "First Order" offer ribbon (appears after scrolling) ──── 
export function StickyOfferRibbon() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem('offerRibbonDismissed');
      if (wasDismissed) {
        setDismissed(true);
        return;
      }
    }

    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('offerRibbonDismissed', '1');
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-r from-[#231F20] via-[#0333B9] to-[#231F20] text-white flex items-center justify-center gap-3 py-2.5 px-4 text-xs sm:text-sm font-bold tracking-wide relative overflow-hidden">
        {/* shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
        <span className="bg-[#D0A967] text-[#231F20] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
          ✦ OFFER
        </span>
        <span className="text-white/90">
          🎉 First Order Discount — Get <strong className="text-[#F4D03F]">₹100 OFF</strong> when you sign in!
        </span>
        <Link
          href="/login"
          className="shrink-0 bg-white text-[#231F20] text-[10px] font-extrabold px-3 py-1 rounded-full hover:bg-[#F4D03F] transition-colors uppercase tracking-wider"
        >
          Claim Now
        </Link>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-lg leading-none"
          aria-label="Dismiss offer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main Export: All floating actions grouped bottom-right ────────────────────
export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
      <ScrollToTopButton />
      <WhatsAppButton />
    </div>
  );
}
