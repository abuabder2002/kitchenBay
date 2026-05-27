'use client';

import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useCart } from '@/lib/cartContext';
import {
  Star, ShoppingCart, Zap, Shield, Truck, Package,
  ChevronLeft, Check, Info
} from 'lucide-react';
import Link from 'next/link';
import BulkInquiryModal from '@/components/BulkInquiryModal';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const { addItem, items } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  if (!product) return notFound();

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const gstAmount = Math.round(product.price * product.gstPercent / 100);
  const cgstPercent = product.gstPercent / 2;
  const sgstPercent = product.gstPercent / 2;
  const cgstAmount = Math.floor(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const inCart = items.find(i => i.product.id === product.id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="capitalize text-gray-400">{product.category}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden aspect-square max-h-[520px] shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Zap size={12} /> Featured
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full capitalize w-fit mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={s <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-50 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                <Info size={13} /> Price Breakdown (CGST + SGST Inclusive)
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price (excl. tax)</span>
                  <span className="font-medium text-gray-800">{formatPrice(product.price)}</span>
                </div>
                {product.gstPercent > 0 ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CGST ({cgstPercent}%)</span>
                      <span className="font-medium text-emerald-600">+ {formatPrice(cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SGST ({sgstPercent}%)</span>
                      <span className="font-medium text-emerald-600">+ {formatPrice(sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Total Tax (CGST + SGST = {product.gstPercent}%)</span>
                      <span>{formatPrice(gstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">GST exempt — no tax applicable</p>
                )}
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Final Price</span>
                  <span className="text-2xl font-bold text-blue-700">{formatPrice(product.finalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2 h-2 rounded-full ${product.stock > 20 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 20 ? 'text-emerald-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {product.stock > 20 ? `In Stock (${product.stock} units)` : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity & Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-11 text-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-11 text-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all ${
                    added
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-200'
                  }`}
                >
                  {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
                </button>
                <Link
                  href="/cart"
                  className="px-5 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Buy Now
                </Link>
              </div>
            )}

            {/* B2B Wholesale Section */}
            <div className="bg-gradient-to-br from-blue-950 to-[#0b1b30] text-white rounded-2xl p-5 mb-6 border border-blue-900 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                <Package size={13} /> Wholesale & Business buyers (B2B)
              </div>
              <h3 className="text-base font-bold mb-2">Interested in Bulk Orders?</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed mb-4">
                Get customized pricing, volume discounts, tax-invoices, and dedicated support for hotels, restaurants, corporate gifting, or resellers.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4 bg-blue-950/40 p-3.5 rounded-xl border border-blue-900/40">
                <div>
                  <span className="block text-[10px] text-blue-400 uppercase font-semibold">Minimum Quantity (MOQ)</span>
                  <span className="text-sm font-bold text-yellow-400">{product.category === 'kitchenware' ? '50 units' : '30 units'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-blue-400 uppercase font-semibold">Estimated Volume Discounts</span>
                  <span className="text-sm font-bold text-emerald-400">Up to 30% OFF</span>
                </div>
              </div>

              {/* Volume Tiers Table */}
              <div className="text-xs border border-blue-900/60 rounded-xl overflow-hidden mb-4">
                <div className="bg-blue-900/20 px-3 py-1.5 font-semibold text-blue-300 border-b border-blue-900/60 grid grid-cols-2">
                  <span>Quantity Range</span>
                  <span className="text-right">Expected Discount</span>
                </div>
                {product.category === 'kitchenware' ? (
                  <div className="divide-y divide-blue-900/40">
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>50 – 99 units</span>
                      <span className="text-right text-emerald-400 font-bold">10% OFF</span>
                    </div>
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>100 – 249 units</span>
                      <span className="text-right text-emerald-400 font-bold">20% OFF</span>
                    </div>
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>250+ units</span>
                      <span className="text-right text-emerald-400 font-bold">30% OFF</span>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-blue-900/40">
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>30 – 74 units</span>
                      <span className="text-right text-emerald-400 font-bold">10% OFF</span>
                    </div>
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>75 – 149 units</span>
                      <span className="text-right text-emerald-400 font-bold">15% OFF</span>
                    </div>
                    <div className="px-3 py-1.5 grid grid-cols-2">
                      <span>150+ units</span>
                      <span className="text-right text-emerald-400 font-bold">25% OFF</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-blue-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Package size={14} /> Request Bulk Quotation
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: Shield, label: 'GST Invoice' },
                { icon: Package, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon size={18} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Bulk Order Inquiry Modal */}
      <BulkInquiryModal 
        product={{
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          finalPrice: product.finalPrice,
          image: product.image
        }}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        initialQuantity={quantity}
      />
    </div>
  );
}
