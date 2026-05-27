'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/mockData';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAuth } from '@/lib/authContext';
import { Heart, Pencil, ShoppingCart } from 'lucide-react';

// Created once at module level — not on every render
const priceFormatter = new Intl.NumberFormat('en-IN');

interface ProductCardProps {
  product: Product;
  isHero?: boolean;
}

export default function ProductCard({ product, isHero = false }: ProductCardProps) {
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { currentUser: user, isAdmin } = useAuth();


  const formatPrice = (price: number) => priceFormatter.format(price);

  return (
    <div className="bg-white rounded-2xl border border-[--color-brand-border] overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col relative group">
      
      {/* Image Area */}
      <div className={`relative ${isHero ? 'aspect-auto h-[300px] md:h-full' : 'aspect-square'} overflow-hidden`}>
        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
          <Image 
            src={product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop'} 
            alt={product.name} 
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        </Link>
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-lg z-10 uppercase tracking-wide">
            {product.discount}% OFF
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-0 right-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-b-lg z-10 uppercase tracking-wide">
            Featured
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product); }}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-[--color-brand-accent] transition-colors z-10 shadow"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={isInWishlist(product.id) ? "fill-[--color-brand-accent] text-[--color-brand-accent]" : ""} />
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex items-end">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
            className="w-full flex items-center justify-center gap-2 bg-white text-[--color-brand-text] font-semibold rounded-full py-2 text-xs hover:bg-[--color-brand-accent] hover:text-white transition-colors shadow-lg"
          >
            <ShoppingCart size={14} /> Quick Add
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Material Tag */}
        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-1.5 uppercase tracking-wider">
          {product.material}
        </span>
        
        <Link href={`/products/${product.id}`} className="mb-2">
          <h3 className="text-sm font-semibold text-[--color-brand-text] line-clamp-2 hover:text-[--color-brand-accent] transition-colors leading-snug">
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
        <div className="flex items-baseline flex-wrap gap-2 mb-3">
          <span className="text-lg font-bold text-[--color-brand-text]">
            ₹{formatPrice(product.finalPrice)}
          </span>
          {product.originalPrice > product.finalPrice && (
            <span className="text-sm line-through text-gray-400">
              ₹{formatPrice(product.originalPrice)}
            </span>
          )}
          {product.discount > 0 && (
            <span className="text-xs text-green-600 font-semibold">
              {product.discount}% off
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 20 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-medium ${product.stock > 20 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {product.stock > 20 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Add to Cart */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }} 
          className="w-full bg-white border-2 border-[--color-brand-accent] text-[--color-brand-accent] font-bold rounded-full py-2 text-sm hover:bg-[--color-brand-accent] hover:text-white transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
