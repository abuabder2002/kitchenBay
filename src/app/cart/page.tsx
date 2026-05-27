'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/cartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, gstAmount, cgstAmount, sgstAmount, total, itemCount } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <ShoppingBag size={72} className="text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Looks like you haven't added anything yet</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-500 text-sm mb-8">{itemCount} item{itemCount > 1 ? 's' : ''} in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const itemGst = Math.round(product.price * product.gstPercent / 100) * quantity;
              const itemTotal = product.finalPrice * quantity;
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition-shadow">
                  <Link href={`/products/${product.id}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-xl bg-gray-50"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-blue-600 font-medium capitalize">{product.category}</span>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mt-0.5">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-gray-400">Base: {formatPrice(product.price)}</span>
                          {product.gstPercent > 0 && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                              CGST {product.gstPercent / 2}% + SGST {product.gstPercent / 2}%
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="self-start text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-800">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(itemTotal)}</p>
                        {product.gstPercent > 0 && (
                          <>
                            <p className="text-xs text-gray-400">
                              CGST {product.gstPercent / 2}%: {formatPrice(Math.floor(itemGst / 2))}
                            </p>
                            <p className="text-xs text-gray-400">
                              SGST {product.gstPercent / 2}%: {formatPrice(itemGst - Math.floor(itemGst / 2))}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

              {/* CGST / SGST Breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Tag size={12} className="text-emerald-500" /> CGST
                  </span>
                  <span className="font-medium text-emerald-600">{formatPrice(cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Tag size={12} className="text-emerald-500" /> SGST
                  </span>
                  <span className="font-medium text-emerald-600">{formatPrice(sgstAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 border-t border-dashed border-gray-100 pt-2">
                  <span>Total Tax (CGST + SGST)</span>
                  <span>{formatPrice(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total (GST incl.)</span>
                  <span className="text-xl font-bold text-blue-700">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">CGST + SGST invoice will be provided</p>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="w-full flex items-center justify-center mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
              >
                Continue Shopping
              </Link>

              <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-50">
                <p className="text-xs text-blue-700 font-medium mb-1">🔒 Secure Checkout</p>
                <p className="text-xs text-blue-600">CGST &amp; SGST compliant invoices for all orders</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
