'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { getItemBasePrice, getItemStock } from '@/lib/pricing';
import {
  Star, ShoppingCart, Truck, Package, ShieldCheck, Check, Info, Minus, Plus, Heart
} from 'lucide-react';
import Link from 'next/link';
import BulkInquiryModal from '@/components/BulkInquiryModal';
import Image from 'next/image';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const { addItem, items } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, isItemLoading } = useWishlist();

  const variants = product?.variants as Record<string, any> | undefined;
  const variantSizes = variants ? Object.keys(variants).filter(Boolean) : [];
  const legacySizes = product?.sizeCategory ? product.sizeCategory.split(',').map(s => s.trim()).filter(Boolean) : [];
  const availableSizes = variantSizes.length > 0 ? variantSizes : legacySizes;

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || '');
  const [sizeError, setSizeError] = useState(false);

  const activeVariant = selectedSize && variants ? variants[selectedSize] : undefined;
  
  const displayDimensions = {
    weight: activeVariant?.weight || product?.weight,
    length: activeVariant?.length || product?.length,
    width: activeVariant?.width || product?.width,
    height: activeVariant?.height || product?.height,
    diameter: activeVariant?.diameter || product?.diameter,
  };
  const hasDimensions = Object.values(displayDimensions).some(v => v);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'story' | 'Kitchenbay' | 'care'>('story');

  if (!product) return notFound();

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // ── Display Price: BASE PRICE ONLY (no GST on product page) ──
  // Uses the selected variant price, or falls back to product.price.
  // GST is NOT displayed or added here per business rule.
  const displayBasePrice = getItemBasePrice(product, selectedSize || undefined);
  const displayStock = getItemStock(product, selectedSize || undefined);

  // Show MRP (crossed-out) only if product has an explicit discount
  const hasDiscount = product.discount > 0;
  // displayOriginalPrice is a purely cosmetic MRP figure for strikethrough
  const displayOriginalPrice = hasDiscount
    ? Math.round(displayBasePrice / (1 - product.discount / 100))
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    
    if (displayStock <= 0) {
      alert('This item is out of stock.');
      return;
    }
    
    const currentInCart = items.find(i => i.product.id === product.id && (i.size || "") === (selectedSize || ""))?.quantity || 0;
    if (currentInCart + quantity > displayStock) {
      alert(`You can only add up to ${displayStock} units. You already have ${currentInCart} in your cart.`);
      return;
    }

    for (let i = 0; i < quantity; i++) addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1 w-full pb-24">
        
        {/* Breadcrumb */}
        <div className="border-b border-[--color-brand-border] bg-white">
          <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-xs uppercase tracking-widest text-[--color-brand-muted]">
            <Link href="/" className="hover:text-[--color-brand-text] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[--color-brand-text] transition-colors">Products</Link>
            <span>/</span>
            <span className="text-[--color-brand-text] font-bold line-clamp-1">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16">
            
            {/* Left: Image Gallery */}
            <div className="space-y-6">
              <div className="relative w-full aspect-square bg-white rounded-sm overflow-hidden shadow-md">
                <Image
                  src={selectedImage || product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop'}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                 {[product.image, ...(product.subImages || [])].filter(Boolean).map((img, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setSelectedImage(img)}
                     className={`relative w-full aspect-square bg-white rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${
                       (selectedImage === img) || (!selectedImage && idx === 0) 
                         ? 'border-[--color-brand-text] opacity-100' 
                         : 'border-transparent opacity-60 hover:opacity-100'
                     }`}
                   >
                      <Image src={img || ''} alt={`Thumb ${idx + 1}`} fill className="object-contain" />
                   </div>
                 ))}
              </div>
            </div>

            {/* Right: Sticky Details */}
            <div className="relative">
              <div className="sticky top-32 space-y-8">
                
                {/* Header */}
                <div>
                  <span className="inline-block text-xs font-bold text-[--color-brand-accent] uppercase tracking-widest mb-4 border border-[--color-brand-accent] px-3 py-1">
                    {product.material}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] leading-tight mb-4">
                    {product.name}
                  </h1>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={16} className={s <= Math.floor(product.rating) ? 'fill-[--color-brand-accent-yellow] text-[--color-brand-accent-yellow]' : 'fill-gray-300 text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[--color-brand-text]">{product.rating}</span>
                    <span className="text-sm text-[--color-brand-muted] underline decoration-[--color-brand-border] hover:decoration-[--color-brand-muted] cursor-pointer transition-colors">
                      {product.reviewCount} Reviews
                    </span>
                  </div>
                </div>

                {/* Price block — Base MRP only. GST applied only at checkout. */}
                <div className="pt-6 border-t border-[--color-brand-border]">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-3xl font-bold text-[--color-brand-text]">{formatPrice(displayBasePrice)}</span>
                    {hasDiscount && displayOriginalPrice > 0 && (
                      <span className="text-xl line-through text-[--color-brand-muted]">{formatPrice(displayOriginalPrice)}</span>
                    )}
                    {hasDiscount && (
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{product.discount}% off</span>
                    )}
                  </div>
                  <p className="text-xs text-[--color-brand-muted] uppercase tracking-widest mb-1">+ GST & shipping at checkout</p>


                </div>

                {/* Description */}
                <div className="border-t border-[--color-brand-border] pt-6">
                  <p className="text-xs font-bold text-[--color-brand-muted] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={12} />
                    About this Product
                  </p>
                  <div className="space-y-3">
                    {product.description
                      .split(/\n+/)
                      .map((para, i) => para.trim())
                      .filter(para => para.length > 0)
                      .map((para, i) => (
                        <p key={i} className="text-[--color-brand-text] leading-relaxed text-sm">
                          {para}
                        </p>
                      ))
                    }
                  </div>
                </div>

                {/* Available Sizes */}
                {availableSizes.length > 0 && (
                  <div className="pt-4">
                    <p className="text-xs font-bold text-[--color-brand-muted] uppercase tracking-widest mb-2 flex items-center gap-2">
                      Select Size: {sizeError && <span className="text-red-500 font-normal lowercase">(Please select a size)</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size: string, idx: number) => (
                        <button 
                          key={idx} 
                          onClick={() => { setSelectedSize(size); setSizeError(false); }}
                          className={`px-4 py-2 border rounded-sm text-sm font-bold shadow-sm transition-colors ${
                            selectedSize === size 
                              ? 'border-brand-text bg-brand-text text-white' 
                              : 'border-brand-border bg-white text-brand-text hover:border-brand-text'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Area */}
                {product.isActive === false ? (
                  <div className="pt-6 border-t border-[--color-brand-border]">
                     <div className="bg-gray-100 text-gray-600 font-bold uppercase tracking-widest py-4 text-center rounded-sm border border-gray-300">
                        Currently Unavailable
                     </div>
                  </div>
                ) : displayStock > 0 ? (
                  <div className="space-y-4 pt-6 border-t border-[--color-brand-border]">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      {/* Quantity selector */}
                      <div className="flex items-center justify-between sm:justify-center border border-[--color-brand-text] rounded-sm">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-6 sm:px-4 py-3 text-[--color-brand-text] hover:bg-[--color-brand-card] transition-colors"><Minus size={16}/></button>
                        <span className="w-12 sm:w-8 text-center font-bold text-[--color-brand-text]">{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.min(displayStock, q + 1))} className="px-6 sm:px-4 py-3 text-[--color-brand-text] hover:bg-[--color-brand-card] transition-colors"><Plus size={16}/></button>
                      </div>
                      
                      <button
                        onClick={handleAddToCart}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 font-bold uppercase tracking-widest text-sm transition-all rounded-sm ${
                          added
                            ? 'bg-[--color-brand-success] text-white'
                            : 'bg-[--color-brand-text] hover:bg-[--color-brand-accent] text-[--color-brand-bg]'
                        }`}
                      >
                        {added ? <><Check size={18} /> Added</> : 'Add to Cart'}
                      </button>

                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (isItemLoading(product.id)) return;
                          if (isInWishlist(product.id)) {
                            removeFromWishlist(product.id);
                          } else {
                            addToWishlist(product);
                          }
                        }}
                        disabled={isItemLoading(product.id)}
                        className={`flex items-center justify-center px-6 py-4 border-2 border-[--color-brand-border] rounded-sm transition-all duration-300 ${
                          isItemLoading(product.id)
                            ? 'opacity-50 cursor-wait text-gray-400 bg-gray-50'
                            : 'hover:scale-110 cursor-pointer text-gray-400 hover:text-red-500 hover:border-red-200'
                        }`}
                        aria-label="Toggle wishlist"
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={20} className={`transition-colors duration-300 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                    </div>

                    <Link
                      href="/cart"
                      className="block w-full text-center py-4 border-2 border-[--color-brand-text] text-[--color-brand-text] font-bold uppercase tracking-widest text-sm hover:bg-[--color-brand-text] hover:text-[--color-brand-bg] transition-colors rounded-sm"
                    >
                      Buy It Now
                    </Link>

                    <p className="text-xs font-bold text-[--color-brand-success] uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                       <Check size={14}/> Ready to ship — {displayStock} in stock
                    </p>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-[--color-brand-border]">
                     <div className="bg-red-50 text-red-600 font-bold uppercase tracking-widest py-4 text-center rounded-sm border border-red-200">
                        Out of Stock
                     </div>
                  </div>
                )}

                {/* Dimensions / Specifications */}
                {hasDimensions && (
                  <div className="pt-8 mt-8 border-t border-[--color-brand-border]">
                    <h3 className="font-bold text-[--color-brand-text] uppercase tracking-widest text-sm mb-4">Specifications</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      {displayDimensions.weight && (
                        <>
                          <span className="text-[--color-brand-muted]">Weight</span>
                          <span className="font-medium text-[--color-brand-text] text-right">{displayDimensions.weight} {Number(displayDimensions.weight) < 10 ? 'kg' : 'g'}</span>
                        </>
                      )}
                      {displayDimensions.length && (
                        <>
                          <span className="text-[--color-brand-muted]">Length</span>
                          <span className="font-medium text-[--color-brand-text] text-right">{displayDimensions.length} cm</span>
                        </>
                      )}
                      {displayDimensions.width && (
                        <>
                          <span className="text-[--color-brand-muted]">Width</span>
                          <span className="font-medium text-[--color-brand-text] text-right">{displayDimensions.width} cm</span>
                        </>
                      )}
                      {displayDimensions.height && (
                        <>
                          <span className="text-[--color-brand-muted]">Height</span>
                          <span className="font-medium text-[--color-brand-text] text-right">{displayDimensions.height} cm</span>
                        </>
                      )}
                      {displayDimensions.diameter && (
                        <>
                          <span className="text-[--color-brand-muted]">Diameter</span>
                          <span className="font-medium text-[--color-brand-text] text-right">{displayDimensions.diameter} cm</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-8">
                  {[
                    { icon: Truck, label: 'Free Worldwide Shipping' },
                    { icon: ShieldCheck, label: 'Authentic Heritage' },
                    { icon: Package, label: 'Secure Packaging' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-4 bg-white border border-[--color-brand-border] rounded-sm">
                      <Icon size={24} className="text-[--color-brand-accent]" />
                      <span className="text-xs font-bold text-[--color-brand-text] uppercase tracking-wide leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Bulk Wholesale */}
                <div className="p-6 rounded-sm shadow-sm mt-8 border border-[#E8DDD0]" style={{ backgroundColor: '#F5EFE6' }}>
                  <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-xs font-bold" style={{ color: '#8B6914' }}>
                    <Package size={16} /> Wholesale / B2B
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2" style={{ color: '#2D2D2D' }}>Curating for a project?</h3>
                  <p className="text-sm mb-6" style={{ color: '#555555' }}>
                    Special pricing available for restaurants, hotels, and corporate gifting. Minimum order {product.category === 'kitchenware' ? '50' : '30'} units.
                  </p>
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="w-full bg-[--color-brand-text] hover:bg-[--color-brand-accent] text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors rounded-sm"
                  >
                    Request Trade Quote
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Section: Story / Kitchenbay / Care ──────────────────────── */}
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
           <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-[--color-brand-border] mb-12">
              {[
                { id: 'story', label: 'The Story' },
                { id: 'Kitchenbay', label: 'The Maker' },
                { id: 'care', label: 'Care & Use' }
              ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                     activeTab === tab.id 
                       ? 'text-[--color-brand-text] border-b-2 border-[--color-brand-accent]' 
                       : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'
                   }`}
                 >
                   {tab.label}
                 </button>
              ))}
           </div>
           
           <div className="text-center font-serif text-xl md:text-2xl text-[--color-brand-text] leading-relaxed max-w-3xl mx-auto">
              {activeTab === 'story' && (
                <p>
                  Rooted in centuries-old traditions, this {product.material} piece is shaped exactly as it was during the eras of ancient Indian kingdoms. The craft has survived through generations, passing from father to son, preserving not just a technique, but a way of life that celebrates slow, intentional creation.
                </p>
              )}
              {activeTab === 'Kitchenbay' && (
                <p>
                  Crafted by master Kitchenbays in rural clusters who have dedicated their entire lives to perfecting the art of working with {product.material}. Every hammer mark and curve is a testament to human hands. By bringing this to your home, you directly support their livelihood and help keep this dying art alive.
                </p>
              )}
              {activeTab === 'care' && (
                <p>
                  Natural materials require natural care. Wash only with mild soap and warm water. Avoid harsh chemicals or abrasive scrubbers. Dry completely immediately after washing to prevent natural oxidation. With love and proper seasoning, this piece will outlive us all.
                </p>
              )}
           </div>
        </div>

        {/* ── Related Products ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[--color-brand-border] pt-24">
            <div className="text-center mb-16">
              <span className="text-[--color-brand-muted] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Complete The Look</span>
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">You May Also Love</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
