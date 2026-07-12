'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/mockData';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAuth } from '@/lib/authContext';
import { Check, Heart, Pencil, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Created once at module level — not on every render
const priceFormatter = new Intl.NumberFormat('en-IN');

// Normalize image src: handle URLs, /paths, data URIs, and raw base64 blobs
function normalizeImageSrc(image: string | undefined | null): string {
  if (!image) return '/artisan_kitchenware.png';
  // Already a valid URL or local path
  if (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')) {
    return image;
  }
  // Raw base64 blob stored in DB — prepend the data URI header
  return `data:image/jpeg;base64,${image}`;
}

interface ProductCardProps {
  product: Product;
  isHero?: boolean;
}

export default function ProductCard({ product, isHero = false }: ProductCardProps) {
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, isItemLoading } = useWishlist();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const requiresSize = !!product.sizeCategory?.trim();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresSize) {
      router.push(`/products/${product.id}`);
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresSize) {
      router.push(`/products/${product.id}`);
      return;
    }
    addToCart(product, undefined, true);
    router.push('/checkout');
  };

  const formatPrice = (price: number) => priceFormatter.format(price);

  return (
    <div className="bg-white rounded-2xl border border-[--color-brand-blue-mid] overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full flex flex-col relative group">
      
      {/* Image Area */}
      <div className={`relative ${isHero ? 'aspect-auto h-[300px] md:h-full' : 'aspect-square'} overflow-hidden`}>
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <img
            src={normalizeImageSrc(product.image)}
            alt={`${product.name} - Premium ${product.material} ${product.category}`}
            className="absolute inset-0 w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white"
            loading="lazy"
          />
        </Link>
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#F4D03F] text-[#4A2C2A] text-[10px] font-bold px-2.5 py-1 rounded-br-lg z-10 uppercase tracking-wide overflow-hidden shadow-sm">
            {/* Glistening Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative z-10">{product.discount}% OFF</span>
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-0 right-10 text-[10px] font-bold px-2 py-0.5 rounded-b-lg z-10 uppercase tracking-wide" style={{backgroundColor: 'var(--color-brand-blue-light)', color: 'var(--color-brand-blue-text)', border: '1px solid var(--color-brand-blue-mid)'}}>
            Featured
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            if (isItemLoading(product.id)) return;
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist(product);
            }
          }}
          disabled={isItemLoading(product.id)}
          className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow z-10 transition-all duration-300 ${
            isItemLoading(product.id)
              ? 'opacity-50 cursor-wait text-gray-400'
              : 'hover:scale-110 cursor-pointer text-gray-400 hover:text-red-500'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={`transition-colors duration-300 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Edit Pencil Icon (Admin Only) */}
        {isAdmin && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Edit Product Image'); }}
            className="absolute top-12 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10 shadow"
            title="Edit Image"
          >
            <Pencil size={14} />
          </button>
        )}

        {/* Quick Add to Cart on Hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 hidden md:flex items-end">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 font-semibold rounded-full py-2 text-xs shadow-lg transition-colors" style={{backgroundColor: 'var(--color-brand-blue-light)', color: 'var(--color-brand-blue-text)', border: '1px solid var(--color-brand-blue-mid)'}}
          >
            <ShoppingCart size={14} /> {requiresSize ? 'Select Size' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Material Tag */}
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full w-fit mb-1.5 uppercase tracking-wider" style={{backgroundColor: 'var(--color-brand-blue-light)', color: 'var(--color-brand-blue-text)', border: '1px solid var(--color-brand-blue-mid)'}}>
          {product.material}
        </span>
        
        <Link href={`/products/${product.id}`} className="mb-2">
          <h3 className="text-sm font-semibold text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            <div className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {product.rating} ★
            </div>
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex-1" />

        {/* Price Row */}
        <div className="flex items-baseline flex-wrap gap-1 sm:gap-2 mb-0.5">
          <span className="text-base font-bold text-[--color-brand-text]">
            Rs. {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs line-through text-gray-400">
              Rs. {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.discount > 0 && (
            <span className="text-[10px] text-green-600 font-semibold">
              {product.discount}% off
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-400 font-semibold mb-2">GST (5%) Added</div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 20 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-medium ${product.stock > 20 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {product.stock > 20 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Add to Cart & Buy Now grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={handleAddToCart}
            disabled={added || product.stock <= 0}
            className={`w-full flex items-center justify-center gap-1 font-bold rounded-full py-2 text-xs transition-all duration-200 ${
              added 
                ? 'bg-green-500 text-white border-green-500 scale-95' 
                : ''
            } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={added ? {} : {backgroundColor: 'var(--color-brand-blue-light)', color: 'var(--color-brand-blue-text)', border: '1px solid var(--color-brand-blue-mid)'}}
            onMouseEnter={e => { if (!added && product.stock > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-blue-mid)'; }}
            onMouseLeave={e => { if (!added && product.stock > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-blue-light)'; }}
          >
            {added ? <><Check size={12} /> Added!</> : requiresSize ? 'Select Size' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`w-full flex items-center justify-center gap-1 font-bold rounded-full py-2 text-xs transition-all duration-200 active:scale-95 ${
              product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{backgroundColor: 'var(--color-brand-blue-text)', color: 'white', border: '1px solid var(--color-brand-blue-text)'}}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-accent)'; }}
            onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-blue-text)'; }}
          >
            {requiresSize ? 'Select Size' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
