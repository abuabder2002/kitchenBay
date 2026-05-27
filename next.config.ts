import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    // Disable optimization in development to prevent 504 Gateway Timeout errors
    unoptimized: process.env.NODE_ENV === 'development',
    // Allow Next.js <Image> to optimise images from these external hosts
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
    // Serve modern formats — AVIF (40–60% smaller) then WebP (25–35% smaller)
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 1 week on the server
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
