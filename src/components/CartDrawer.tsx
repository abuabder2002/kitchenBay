'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { getItemStock, getItemBasePrice } from '@/lib/pricing';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
    gstAmount,
    shippingFee,
    total
  } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeDrawer]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-[--color-brand-text]" strokeWidth={1.5} />
            <h2 className="text-base font-bold uppercase tracking-widest text-[--color-brand-text]">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-[--color-brand-accent] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                <ShoppingBag size={32} className="text-gray-300" strokeWidth={1} />
              </div>
              <div>
                <p className="font-bold text-gray-700 mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-400">Discover our handcrafted collection and add items you love.</p>
              </div>
              <button
                onClick={() => { closeDrawer(); router.push('/products'); }}
                className="mt-2 px-6 py-2.5 bg-[--color-brand-text] text-white rounded-full text-sm font-semibold hover:bg-[--color-brand-accent] transition-colors"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 px-4 py-2">
              {items.map((item, idx) => {
                const basePrice = getItemBasePrice(item.product, item.size);
                const maxStock = getItemStock(item.product, item.size);
                
                const itemGst = Math.round(basePrice * item.product.gstPercent / 100);
                const itemFinalPrice = basePrice + itemGst;
                const isOutOfStock = maxStock <= 0;
                const isReduced = item.quantity > maxStock && maxStock > 0;

                return (
                  <li key={`${item.product.id}-${item.size || idx}`} className={`flex gap-4 py-4 group animate-in fade-in slide-in-from-right-2 duration-200 ${isOutOfStock ? 'bg-red-50/50 px-2 rounded-lg' : ''}`}>
                    {/* Product Image */}
                    <Link href={`/products/${item.product.id}`} onClick={closeDrawer} className="shrink-0">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={item.product.image || '/images/marketing/everyday_cooking.jpg'}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain bg-white"
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.product.id}`} onClick={closeDrawer}>
                        <p className="text-sm font-semibold text-[--color-brand-text] hover:text-[--color-brand-accent] transition-colors leading-snug line-clamp-2">
                          {item.product.name}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{item.product.material}</p>
                        {item.size && (
                          <>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs font-bold text-[--color-brand-accent] uppercase tracking-wider">{item.size}</span>
                          </>
                        )}
                      </div>
                      {isOutOfStock && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md w-fit">
                          <AlertTriangle size={10} /> Out of Stock
                        </div>
                      )}
                      {isReduced && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md w-fit">
                          <AlertTriangle size={10} /> Reduced to {maxStock}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 border border-gray-200 rounded-full overflow-hidden bg-white">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1, item.size) : removeItem(item.product.id, item.size)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[--color-brand-accent] hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-[--color-brand-text] w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[--color-brand-accent] hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[--color-brand-text]">
                          {formatPrice(basePrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 pt-4 pb-6 space-y-3">
            {/* Order Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span className="font-semibold text-[--color-brand-text]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3">
              <div className="flex justify-between font-bold text-[--color-brand-text] mb-1">
                <span>Estimated Total</span>
                <span className="text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-[--color-brand-muted] mb-4 text-right">+ GST & shipping at checkout</p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { 
                    closeDrawer(); 
                    if (!currentUser) {
                      router.push('/login?next=/checkout&message=checkout');
                    } else {
                      router.push('/checkout'); 
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[--color-brand-text] hover:bg-[--color-brand-accent] text-white font-bold py-3.5 rounded-full text-sm transition-colors group shadow-sm"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[--color-brand-blue-mid] text-[--color-brand-blue-text] hover:bg-[--color-brand-blue-light] font-semibold py-3 rounded-full text-sm transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            </div>

            {/* Trust Badge */}
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-wider pt-1">
              🔒 Secure checkout · Free returns
            </p>
          </div>
        )}
      </div>
    </>
  );
}
