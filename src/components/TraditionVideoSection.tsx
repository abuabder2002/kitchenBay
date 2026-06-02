'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface TraditionVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string | null;
  link?: string | null;
}

// ── Fade-up hook using IntersectionObserver ──────────────────────────────────
function useFadeUp(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ── Featured (autoplay) video card ───────────────────────────────────────────
function FeaturedVideoCard({ video }: { video: TraditionVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const { ref: wrapRef, visible } = useFadeUp(0.2);

  // Autoplay when card enters viewport
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !visible) return;
    el.muted = true;
    el.play().then(() => setPlaying(true)).catch(() => {});
  }, [visible]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const content = (
    <div
      ref={wrapRef}
      className="relative w-full rounded-xl overflow-hidden shadow-2xl group"
      style={{
        border: '1px solid rgba(193,154,107,0.45)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(193,154,107,0.2)',
        transition: 'transform 0.5s ease, box-shadow 0.5s ease, filter 0.5s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
      }}
    >
      {/* Inner hover glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100"
        style={{
          transition: 'opacity 0.4s ease',
          boxShadow: 'inset 0 0 0 1.5px rgba(193,154,107,0.6)',
        }}
      />

      {/* Video */}
      <div
        className="relative w-full"
        style={{ paddingBottom: '56.25%' /* 16:9 */ }}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail || undefined}
          muted
          playsInline
          loop
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: 'filter 0.4s ease, transform 0.6s ease',
            filter: 'brightness(0.92)',
          }}
          onMouseEnter={e => {
            (e.target as HTMLVideoElement).style.filter = 'brightness(1.05)';
            (e.target as HTMLVideoElement).style.transform = 'scale(1.025)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLVideoElement).style.filter = 'brightness(0.92)';
            (e.target as HTMLVideoElement).style.transform = 'scale(1)';
          }}
        />
      </div>

      {/* Bottom gradient + title */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-7"
        style={{ background: 'linear-gradient(to top, rgba(20,14,10,0.88) 0%, transparent 100%)' }}
      >
        {/* Gold accent line */}
        <div className="w-10 h-[2px] mb-3" style={{ background: 'linear-gradient(90deg,#C19A6B,transparent)' }} />
        <p className="text-white font-bold text-base md:text-xl leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
          {video.title}
        </p>
        {video.link && (
          <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#C19A6B', borderBottom: '1px solid rgba(193,154,107,0.4)', paddingBottom: '2px' }}>
            View Product →
          </span>
        )}
      </div>

      {/* Mute toggle */}
      {playing && (
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute top-4 right-4 z-30 flex items-center justify-center rounded-full w-9 h-9 backdrop-blur-sm"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(193,154,107,0.5)',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(193,154,107,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
        >
          {muted
            ? <VolumeX size={15} color="#C19A6B" />
            : <Volume2 size={15} color="#C19A6B" />}
        </button>
      )}
    </div>
  );

  return video.link
    ? <Link href={video.link} className="block">{content}</Link>
    : content;
}

// ── Supporting video card ─────────────────────────────────────────────────────
function SupportingVideoCard({ video, delay = 0 }: { video: TraditionVideo; delay?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref: wrapRef, visible } = useFadeUp(0.15);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.muted = true;
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const content = (
    <div
      ref={wrapRef}
      className="relative w-full rounded-xl overflow-hidden group cursor-pointer"
      onClick={handlePlay}
      style={{
        border: '1px solid rgba(193,154,107,0.35)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.4s ease`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(193,154,107,0.55)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
      }}
    >
      {/* Video */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail || undefined}
          muted
          playsInline
          loop
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: 'filter 0.4s ease, transform 0.6s ease',
            filter: isPlaying ? 'brightness(1)' : 'brightness(0.75)',
            transform: isPlaying ? 'scale(1.02)' : 'scale(1)',
          }}
        />
      </div>

      {/* Play overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{ background: 'rgba(10,6,4,0.18)' }}>
          <div
            className="flex items-center justify-center rounded-full mb-3 group-hover:scale-110"
            style={{
              width: 56, height: 56,
              background: 'rgba(193,154,107,0.18)',
              border: '2px solid rgba(193,154,107,0.7)',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.35s ease, background 0.35s ease',
            }}
          >
            <Play size={22} fill="#C19A6B" color="#C19A6B" style={{ marginLeft: 3 }} />
          </div>
        </div>
      )}

      {/* Bottom label */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4"
        style={{ background: 'linear-gradient(to top, rgba(20,14,10,0.85) 0%, transparent 100%)' }}
      >
        <div className="w-7 h-[1.5px] mb-2" style={{ background: '#C19A6B' }} />
        <p className="text-white font-semibold text-sm leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
          {video.title}
        </p>
        {video.link && (
          <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(193,154,107,0.85)' }}>
            View Product →
          </span>
        )}
      </div>

      {/* Playing pause hint */}
      {isPlaying && (
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(193,154,107,0.85)', color: '#2C1A0E' }}>
            Pause
          </div>
        </div>
      )}
    </div>
  );

  return video.link
    ? <Link href={video.link} className="block" onClick={handlePlay}>{content}</Link>
    : content;
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function TraditionVideoSection() {
  const [videos, setVideos] = useState<TraditionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref: headingRef, visible: headingVisible } = useFadeUp(0.2);

  useEffect(() => {
    fetch('/api/videos')
      .then(r => r.ok ? r.json() : [])
      .then((data: TraditionVideo[]) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Don't render the section if there are no videos
  if (!loading && videos.length === 0) return null;

  const featured = videos[0];
  const supporting = videos.slice(1, 3); // up to 2 supporting

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Stories Behind Every Tradition"
      style={{ background: '#FAF8F5' }}
    >
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(193,154,107,0.35) 30%, rgba(193,154,107,0.35) 70%, transparent)' }} />

      {/* Subtle bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(193,154,107,0.25) 30%, rgba(193,154,107,0.25) 70%, transparent)' }} />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <div
          ref={headingRef}
          className="text-center mb-16 md:mb-20"
          style={{
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          {/* Decorative icon */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(193,154,107,0.7))' }} />
            <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: 'rgba(193,154,107,0.8)' }}>
              KitchenBay Heritage
            </span>
            <div className="h-[1px] w-12 md:w-20" style={{ background: 'linear-gradient(90deg, rgba(193,154,107,0.7), transparent)' }} />
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#3E322A',
            }}
          >
            Stories Behind Every<br className="hidden sm:block" />
            <span style={{ color: '#C19A6B' }}> Tradition</span>
          </h2>

          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#8C7B6D' }}>
            From ancient artisan workshops to your kitchen — witness the craft, passion and heritage
            that make every KitchenBay piece extraordinary.
          </p>
        </div>

        {/* ── Video Layout ─────────────────────────────────────────────────── */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-pulse">
            <div className="w-full rounded-xl bg-[#EDE9E3]" style={{ paddingBottom: '56.25%' }} />
            <div className="grid grid-cols-1 gap-6">
              <div className="w-full rounded-xl bg-[#EDE9E3]" style={{ paddingBottom: '56.25%' }} />
              <div className="w-full rounded-xl bg-[#EDE9E3]" style={{ paddingBottom: '56.25%' }} />
            </div>
          </div>
        ) : (
          <>
            {/* Single video — full width centered */}
            {videos.length === 1 && featured && (
              <div className="max-w-4xl mx-auto">
                <FeaturedVideoCard video={featured} />
              </div>
            )}

            {/* Two videos — side by side */}
            {videos.length === 2 && featured && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <FeaturedVideoCard video={featured} />
                <SupportingVideoCard video={videos[1]} delay={120} />
              </div>
            )}

            {/* Three or more — featured large + 2 supporting */}
            {videos.length >= 3 && featured && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-start">
                {/* Left: Featured */}
                <FeaturedVideoCard video={featured} />

                {/* Right: 2 supporting stacked */}
                <div className="grid grid-cols-1 gap-6">
                  {supporting.map((v, i) => (
                    <SupportingVideoCard key={v.id} video={v} delay={100 + i * 120} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Footer caption ──────────────────────────────────────────────── */}
        {!loading && videos.length > 0 && (
          <div className="mt-14 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(193,154,107,0.55))' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: '#C19A6B' }}>
                Handcrafted with Heritage
              </span>
              <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg, rgba(193,154,107,0.55), transparent)' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
