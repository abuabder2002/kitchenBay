'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Normalize image src: handle URLs, /paths, data URIs, and raw base64
function normalizeImgSrc(src: string | undefined | null): string {
  if (!src) return '/artisan_kitchenware.png';
  if (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:')) return src;
  return `data:image/jpeg;base64,${src}`;
}


import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { useWishlist } from '@/lib/wishlistContext';
import { getItemBasePrice, getItemStock } from '@/lib/pricing';
import {
  Star, ShoppingCart, Truck, Package, ShieldCheck, Check, Info, Minus, Plus, Heart, ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const BulkInquiryModal = dynamic(() => import('@/components/BulkInquiryModal'), { ssr: false });
const MobileImageViewer = dynamic(() => import('@/components/MobileImageViewer'), { ssr: false });
import Image from 'next/image';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { productSchema } from '@/lib/schemas';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Helper to get custom attributes
  const getAttrValue = (name: string, fallback: string): string => {
    if (!product || !product.attributes) return fallback;
    const found = product.attributes.find((a: any) => a.name.toLowerCase() === name.toLowerCase());
    return found ? found.value : fallback;
  };

  const getDefaultColor = (material: string): string => {
    if (!material) return "Silver";
    const mat = material.toLowerCase();
    if (mat.includes("cast iron")) return "Charcoal Black";
    if (mat.includes("brass")) return "Gold / Golden";
    if (mat.includes("copper")) return "Reddish Bronze";
    if (mat.includes("soapstone")) return "Grey Stone";
    if (mat.includes("clay") || mat.includes("terracotta")) return "Clay Red";
    return "Silver";
  };

  const hasLid = (name: string, category: string): string => {
    const combined = `${name || ""} ${category || ""}`.toLowerCase();
    if (combined.includes("lid") || combined.includes("casserole") || combined.includes("biryani pot") || combined.includes("kadai with lid")) {
      return "Yes";
    }
    return "No";
  };

  const isDishwasherSafe = (material: string): string => {
    if (!material) return "No (Hand wash recommended)";
    const mat = material.toLowerCase();
    if (mat.includes("stainless steel")) return "Yes";
    return "No (Hand wash recommended)";
  };

  const getLidMaterial = (name: string, material: string): string => {
    const combined = `${name || ""} ${material || ""}`.toLowerCase();
    if (!combined.includes("lid") && !combined.includes("casserole") && !combined.includes("biryani pot")) {
      return "N/A";
    }
    if (combined.includes("glass")) return "Glass";
    if (combined.includes("stainless steel")) return "Stainless Steel";
    if (combined.includes("brass")) return "Brass";
    if (combined.includes("copper")) return "Copper";
    if (combined.includes("cast iron")) return "Cast Iron";
    return "Wood / Matching Material";
  };

  const isInductionBottom = (name: string, material: string): string => {
    const combined = `${name || ""} ${material || ""}`.toLowerCase();
    if (combined.includes("induction") || combined.includes("stainless steel") || combined.includes("cast iron")) {
      return "Yes";
    }
    return "No";
  };

  const isAirtight = (name: string, category: string): string => {
    const combined = `${name || ""} ${category || ""}`.toLowerCase();
    if (combined.includes("casserole") || combined.includes("box") || combined.includes("container") || combined.includes("jar") || combined.includes("airtight") || combined.includes("tiffin")) {
      return "Yes";
    }
    return "No";
  };

  const isOvenSafe = (material: string): string => {
    if (!material) return "No";
    const mat = material.toLowerCase();
    if (mat.includes("cast iron") || mat.includes("clay") || mat.includes("soapstone") || mat.includes("terracotta")) {
      return "Yes";
    }
    return "No";
  };

  const getRemainingAttributes = () => {
    if (!product || !product.attributes) return [];
    const standardKeys = [
      "pack of", "sales package", "brand", "model name", "model number", "color",
      "brand color", "lid included", "dishwasher safe", "lid material", "shape",
      "capacity", "induction bottom", "airtight", "oven and broiler safe",
      "manufactured, packed & marketed by", "manufactured by", "registered address",
      "country of origin", "customer support contact", "customer support"
    ];
    return product.attributes.filter((attr: any) => !standardKeys.includes(attr.name.toLowerCase().trim()));
  };
  const { products } = useProducts();
  const contextProduct = products.find((p: any) => p.id === id);
  const [product, setProduct] = useState<any>(contextProduct);
  const [isLoading, setIsLoading] = useState(!contextProduct);

  useEffect(() => {
    setSelectedImage(null);
    setQuantity(1);
    setIsDescriptionExpanded(false);

    // Reset selected size when product changes
    if (contextProduct) {
      const vSizes = contextProduct.variants ? Object.keys(contextProduct.variants).filter(Boolean) : [];
      const lSizes = contextProduct.sizeCategory ? String(contextProduct.sizeCategory).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const aSizes = vSizes.length > 0 ? vSizes : lSizes;
      setSelectedSize(aSizes[0] || '');
    } else {
      setSelectedSize('');
    }

    fetch(`/api/products/${id}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) {
          setProduct(data);
          const vSizes = data.variants ? Object.keys(data.variants).filter(Boolean) : [];
          const lSizes = data.sizeCategory ? String(data.sizeCategory).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          const aSizes = vSizes.length > 0 ? vSizes : lSizes;
          setSelectedSize(aSizes[0] || '');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);
  const { addItem, items } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, isItemLoading } = useWishlist();

  const variants = product?.variants as Record<string, any> | undefined;
  const variantSizes = variants ? Object.keys(variants).filter(Boolean) : [];
  const legacySizes = product?.sizeCategory ? product.sizeCategory.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
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

  useEffect(() => {
    if (selectedSize && variants && variants[selectedSize]?.image) {
      setSelectedImage(variants[selectedSize].image);
    } else {
      setSelectedImage(null);
    }
  }, [selectedSize, variants]);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('center center');

  const [isMobileViewerOpen, setIsMobileViewerOpen] = useState(false);
  const [mobileViewerIndex, setMobileViewerIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<'specifications' | 'description' | 'manufacturer'>('specifications');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const isVideoUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    if (url.startsWith('data:')) {
      return url.startsWith('data:video/');
    }
    const lowercase = url.toLowerCase();
    return (
      lowercase.endsWith('.mp4') ||
      lowercase.endsWith('.webm') ||
      lowercase.endsWith('.ogg') ||
      lowercase.endsWith('.mov') ||
      lowercase.includes('/video')
    );
  };

  const variantImages = variants
    ? Object.values(variants)
      .map((v: any) => v?.image)
      .filter(Boolean)
    : [];

  const rawImages = Array.from(new Set([
    product?.image,
    ...(product?.subImages || []),
    ...variantImages
  ])).filter(Boolean);
  const rawVideo = product?.video;

  const imagesList: { type: string; url: string }[] = [];
  const videosList: { type: string; url: string }[] = [];

  rawImages.forEach(url => {
    if (isVideoUrl(url)) {
      videosList.push({ type: 'video', url });
    } else {
      imagesList.push({ type: 'image', url });
    }
  });

  if (rawVideo) {
    if (!videosList.some(v => v.url === rawVideo)) {
      videosList.push({ type: 'video', url: rawVideo });
    }
  }

  const allMedia = [...imagesList, ...videosList];

  const currentMedia = allMedia.find(m => m.url === selectedImage) || allMedia[0] || { type: 'image', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop' };
  const currentIndex = allMedia.findIndex(m => m.url === currentMedia.url);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return; // Disable hover zoom on mobile
    if ((e.target as HTMLElement).closest('button')) {
      setIsZoomed(false);
      return;
    }
    setIsZoomed(true);
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMedia.length <= 1) return;
    const prevIndex = (currentIndex - 1 + allMedia.length) % allMedia.length;
    setSelectedImage(allMedia[prevIndex].url);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allMedia.length <= 1) return;
    const nextIndex = (currentIndex + 1) % allMedia.length;
    setSelectedImage(allMedia[nextIndex].url);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[--color-brand-bg]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
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

  const formatPrice = (price: number) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
  };

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

  const handleBuyNow = () => {
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

    for (let i = 0; i < quantity; i++) addItem(product, selectedSize, true);
    if (!currentUser) {
      router.push('/login?next=/checkout&message=checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1 w-full pb-24">

        <JsonLd data={productSchema(product)} />
        <Breadcrumbs items={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          ...(product.category ? [{ name: product.category, href: `/products?category=${product.category}` }] : []),
          { name: product.name, href: `/products/${product.id}` },
        ]} />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16">

            {/* Left: Image Gallery */}
            <div className="space-y-6">
              <div
                className="group relative w-full aspect-square bg-white rounded-sm overflow-hidden shadow-md cursor-pointer md:cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setMobileViewerIndex(currentIndex);
                    setIsMobileViewerOpen(true);
                  }
                }}
              >
                {currentMedia.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    className="absolute inset-0 w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <Image
                    src={normalizeImgSrc(currentMedia.url)}
                    alt={product.name}
                    fill
                    priority={true}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`absolute inset-0 w-full h-full object-contain transition-transform ease-out duration-150 ${isZoomed ? 'scale-[2.5]' : 'scale-100'}`}
                    style={{ transformOrigin: isZoomed ? backgroundPosition : 'center center' }}
                  />
                )}

                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {allMedia.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allMedia.map((media, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(media.url)}
                      className={`relative w-full aspect-square bg-white rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${currentMedia.url === media.url
                          ? 'border-[--color-brand-text] opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      {media.type === 'video' ? (
                        <video src={media.url} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Image src={normalizeImgSrc(media.url)} alt={`Thumb ${idx + 1}`} fill sizes="100px" className="absolute inset-0 w-full h-full object-contain" />
                      )}
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4l12 6-12 6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tabs Section: Specifications / Description / Manufacturer info ── */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm mt-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Product Specifications & Details</h2>
                  <button
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    aria-label="Toggle details"
                  >
                    {isDetailsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isDetailsOpen && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                      {[
                        { id: 'specifications', label: 'Specifications' },
                        { id: 'description', label: 'Description' },
                        { id: 'manufacturer', label: 'Manufacturer Info' }
                      ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all border ${isActive
                                ? 'bg-[#1A1A1A] text-white border-transparent'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                              }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      {activeTab === 'specifications' && (
                        <div className="text-left space-y-8 font-sans">
                          {/* In the Box */}
                          <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">In the Box</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Pack of</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Pack of", "1")}</p>
                              </div>
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Sales Package</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Sales Package", getAttrValue("Pack of", "1"))}</p>
                              </div>
                            </div>
                          </div>

                          {/* General */}
                          <div className="space-y-3 pt-2">
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">General Specifications</h4>
                            <div className="space-y-3">
                              {/* Brand & Model */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Brand</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{product.brand || "KitchenBay"}</p>
                                </div>
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Model Name</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{product.name}</p>
                                </div>
                              </div>

                              {/* Grid for two columns attributes */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                {/* Model Number */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Model Number</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{product.sku || `KB_${product.id.slice(0, 8).toUpperCase()}`}</p>
                                </div>

                                {/* Color */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Color</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Color", getDefaultColor(product.material))}</p>
                                </div>

                                {/* Brand Color */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Brand Color</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Brand Color", getAttrValue("Color", getDefaultColor(product.material)))}</p>
                                </div>

                                {/* Lid Included */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Lid Included</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Lid Included", hasLid(product.name, product.category))}</p>
                                </div>

                                {/* Dishwasher Safe */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Dishwasher Safe</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Dishwasher Safe", isDishwasherSafe(product.material))}</p>
                                </div>

                                {/* Induction Bottom */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Induction Bottom</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Induction Bottom", isInductionBottom(product.name, product.material))}</p>
                                </div>

                                {/* Airtight */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Airtight</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Airtight", isAirtight(product.name, product.category))}</p>
                                </div>

                                {/* Oven and Broiler Safe */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Oven and Broiler Safe</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Oven and Broiler Safe", isOvenSafe(product.material))}</p>
                                </div>

                                {/* Shape */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Shape</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Shape", "Round")}</p>
                                </div>

                                {/* Capacity */}
                                <div className="border-b border-gray-100 pb-2">
                                  <p className="text-xs text-gray-400 font-medium">Capacity</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{getAttrValue("Capacity", selectedSize || "Standard")}</p>
                                </div>

                                {/* Remaining Custom Attributes */}
                                {getRemainingAttributes().map((attr: any, idx: number) => (
                                  <div className="border-b border-gray-100 pb-2" key={idx}>
                                    <p className="text-xs text-gray-400 font-medium">{attr.name}</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{attr.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'description' && (
                        <div className="text-left space-y-3 text-sm text-gray-700 leading-relaxed font-sans">
                          {product.description
                            .split(/\n+/)
                            .map((para: string) => para.trim())
                            .filter((para: string) => para.length > 0)
                            .map((para: string, i: number) => (
                              <p key={i} className="mb-2">
                                {para}
                              </p>
                            ))
                          }
                        </div>
                      )}

                      {activeTab === 'manufacturer' && (
                        <div className="text-left space-y-6 font-sans">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Manufacturer Details</h4>
                            <div className="space-y-3 text-sm text-gray-700">
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Manufactured, Packed & Marketed By</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                  {getAttrValue("Manufactured, Packed & Marketed By", getAttrValue("Manufactured By", "KitchenBay Private Limited"))}
                                </p>
                              </div>
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Registered Address</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                  {getAttrValue("Registered Address", "KitchenBay Craft Cluster, Chennai, Tamil Nadu, 600001, India")}
                                </p>
                              </div>
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Country of Origin</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                  {getAttrValue("Country of Origin", "India")}
                                </p>
                              </div>
                              <div className="border-b border-gray-100 pb-2">
                                <p className="text-xs text-gray-400 font-medium">Customer Support Contact</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                  {getAttrValue("Customer Support Contact", getAttrValue("Customer Support", "support@kitchenbay.co"))}
                                </p>
                              </div>
                              {/* Additional Manufacturer / Compliance Attributes */}
                              {product?.attributes
                                ?.filter((a: any) => {
                                  const n = a.name.toLowerCase().trim();
                                  return (
                                    n.includes('manufactur') ||
                                    n.includes('importer') ||
                                    n.includes('packer') ||
                                    n.includes('compliance') ||
                                    n.includes('fssai') ||
                                    n.includes('license') ||
                                    n.includes('origin')
                                  ) && ![
                                    "manufactured, packed & marketed by", "manufactured by",
                                    "registered address", "country of origin",
                                    "customer support contact", "customer support"
                                  ].includes(n);
                                })
                                .map((attr: any, idx: number) => (
                                  <div className="border-b border-gray-100 pb-2" key={idx}>
                                    <p className="text-xs text-gray-400 font-medium">{attr.name}</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{attr.value}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Sticky Details */}
            <div className="relative">
              <div className="sticky top-32 space-y-8">

                {/* Header */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block text-xs font-bold text-[--color-brand-accent] uppercase tracking-widest border border-[--color-brand-accent] px-3 py-1">
                      {product.material}
                    </span>
                    {product.brand && (
                      <span className="inline-block text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-300 px-3 py-1">
                        Brand: {product.brand}
                      </span>
                    )}
                  </div>
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
                    <span className="text-3xl font-bold text-[--color-brand-text]">{formatPrice(displayBasePrice * quantity)}</span>
                    {quantity > 1 && (
                      <span className="text-sm text-[--color-brand-muted]">({formatPrice(displayBasePrice)} each)</span>
                    )}
                    {hasDiscount && displayOriginalPrice > 0 && (
                      <span className="text-xl line-through text-[--color-brand-muted]">{formatPrice(displayOriginalPrice * quantity)}</span>
                    )}
                    {hasDiscount && (
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{product.discount}% off</span>
                    )}
                  </div>
                  <p className="text-xs text-[--color-brand-muted] uppercase tracking-widest mb-1">GST ({product.gstPercent ?? 5}%) Added & shipping at checkout</p>


                </div>

                {/* Description */}
                <div className="border-t border-[--color-brand-border] pt-6">
                  <p className="text-xs font-bold text-[--color-brand-muted] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={12} />
                    About this Product
                  </p>
                  <div className="space-y-3 text-sm text-[--color-brand-text] leading-relaxed">
                    {product.description.length > 250 && !isDescriptionExpanded ? (
                      <p>
                        {product.description.slice(0, 250)}...
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded(true)}
                          className="ml-2 font-bold text-[--color-brand-accent] hover:underline focus:outline-none"
                        >
                          Read More
                        </button>
                      </p>
                    ) : (
                      <>
                        {product.description
                          .split(/\n+/)
                          .map((para: string) => para.trim())
                          .filter((para: string) => para.length > 0)
                          .map((para: string, i: number) => (
                            <p key={i} className="mb-2">
                              {para}
                            </p>
                          ))
                        }
                        {product.description.length > 250 && (
                          <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded(false)}
                            className="mt-2 font-bold text-[--color-brand-accent] hover:underline block focus:outline-none"
                          >
                            Show Less
                          </button>
                        )}
                      </>
                    )}
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
                          className={`px-4 py-2 border rounded-sm text-sm font-bold shadow-sm transition-colors ${selectedSize === size
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
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-6 sm:px-4 py-3 text-[--color-brand-text] hover:bg-[--color-brand-card] transition-colors"><Minus size={16} /></button>
                        <span className="w-12 sm:w-8 text-center font-bold text-[--color-brand-text]">{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.min(displayStock, q + 1))} className="px-6 sm:px-4 py-3 text-[--color-brand-text] hover:bg-[--color-brand-card] transition-colors"><Plus size={16} /></button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 font-bold uppercase tracking-widest text-sm transition-all rounded-sm ${added
                            ? 'bg-brand-success text-white'
                            : 'bg-brand-text hover:bg-brand-accent text-white'
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
                        className={`flex items-center justify-center px-6 py-4 border-2 border-[--color-brand-border] rounded-sm transition-all duration-300 ${isItemLoading(product.id)
                            ? 'opacity-50 cursor-wait text-gray-400 bg-gray-50'
                            : 'hover:scale-110 cursor-pointer text-gray-400 hover:text-red-500 hover:border-red-200'
                          }`}
                        aria-label="Toggle wishlist"
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={20} className={`transition-colors duration-300 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      className="block w-full text-center py-4 border-2 border-brand-text text-brand-text font-bold uppercase tracking-widest text-sm hover:bg-brand-text hover:text-brand-bg transition-colors rounded-sm"
                    >
                      Buy It Now
                    </button>

                    <p className="text-xs font-bold text-[--color-brand-success] uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                      <Check size={14} /> Ready to ship — {displayStock} in stock
                    </p>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-[--color-brand-border]">
                    <div className="bg-red-50 text-red-600 font-bold uppercase tracking-widest py-4 text-center rounded-sm border border-red-200">
                      Out of Stock
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                {hasDimensions && (
                  <div className="pt-8 mt-8 border-t border-[--color-brand-border]">
                    <h3 className="font-bold text-[--color-brand-text] uppercase tracking-widest text-sm mb-4">Dimensions</h3>
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
                    { icon: Truck, label: 'Free Shipping Above Rs. 2000' },
                    { icon: ShieldCheck, label: 'Quality Handcrafted Products' },
                    { icon: Package, label: 'Secure Packaging' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-4 bg-white border border-[--color-brand-border] rounded-sm">
                      <Icon size={24} className="text-[--color-brand-accent]" />
                      <span className="text-xs font-bold text-[--color-brand-text] uppercase tracking-wide leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping, Returns & Care FAQs */}
                <div className="pt-8 mt-8 border-t border-[--color-brand-border] space-y-4">
                  <div>
                    <h2 className="font-bold text-[--color-brand-text] uppercase tracking-widest text-sm mb-2">Shipping Information</h2>
                    <p className="text-sm text-[--color-brand-text] leading-relaxed">Standard delivery takes 5-7 business days. We offer free shipping on all orders above Rs. 2000. Pan-India delivery available.</p>
                  </div>
                  <div>
                    <h2 className="font-bold text-[--color-brand-text] uppercase tracking-widest text-sm mb-2">Return Policy</h2>
                    <p className="text-sm text-[--color-brand-text] leading-relaxed">We offer a hassle-free 48-hour return policy for damaged or defective items. Please contact our support team to initiate a return.</p>
                  </div>
                  <div>
                    <h2 className="font-bold text-[--color-brand-text] uppercase tracking-widest text-sm mb-2">Product Care FAQ</h2>
                    <p className="text-sm text-[--color-brand-text] mb-2 leading-relaxed"><strong>Q: How do I clean this product?</strong><br />A: Wash with mild soap and warm water. Avoid harsh chemicals and abrasive scrubbers to protect the finish.</p>
                    <p className="text-sm text-[--color-brand-text] leading-relaxed"><strong>Q: Is it dishwasher safe?</strong><br />A: We highly recommend hand washing to preserve the natural materials and craftsmanship.</p>
                  </div>
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
                    className="w-full bg-brand-text hover:bg-brand-accent text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors rounded-sm"
                  >
                    Request Trade Quote
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>


        {/* ── Related Products ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[--color-brand-border] pt-24">
            <div className="text-center mb-16">
              <span className="text-[--color-brand-muted] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Complete The Look</span>
              <h2 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text]">You May Also Love</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <MobileImageViewer
        isOpen={isMobileViewerOpen}
        onClose={() => setIsMobileViewerOpen(false)}
        images={allMedia.filter(m => m.type === 'image').map(m => normalizeImgSrc(m.url))}
        initialIndex={Math.max(0, allMedia.filter(m => m.type === 'image').findIndex(m => m.url === currentMedia.url))}
      />

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
