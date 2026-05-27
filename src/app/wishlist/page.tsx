'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/lib/wishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <Heart size={72} className="text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-brand-text mb-2">Your wishlist is empty</h2>
          <p className="text-brand-muted mb-6">Save items you love to your wishlist</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Explore Products <ArrowRight size={18} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1920px]">
        <h1 className="font-serif text-4xl font-bold text-brand-text mb-2">My Wishlist</h1>
        <p className="text-brand-muted mb-8">{items.length} item{items.length > 1 ? 's' : ''} saved</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
