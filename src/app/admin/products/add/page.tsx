'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */


import { useState, useMemo, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { useProducts } from '@/lib/productsContext';
import { Package, Calculator, Check, Upload, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { processProductImage } from '@/lib/imageProcessor';

interface DbCategory { id: string; name: string; slug: string; }
interface DbSubcategory { id: string; name: string; categoryId: string; slug: string; }

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '', gstPercent: '5',
    stock: '', category: '', subcategory: '', categoryId: '', subcategoryId: '',
    material: '', image: '', subImages: [] as string[], video: '', rating: '5.0', reviewCount: '0',
    height: '', width: '', length: '', diameter: '', weight: '', sizeCategory: '',
    brand: '', shippingFee: '', shippingMethod: ''
  });
  const [videoUploading, setVideoUploading] = useState(false);
  const [variants, setVariants] = useState<{ [size: string]: { weight: string, length: string, width: string, height: string, diameter: string, price: string, stock: string, image?: string } }>({});
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [attributes, setAttributes] = useState<{name: string, value: string}[]>([]);
  const [saved, setSaved] = useState(false);

  // Dynamic categories/subcategories from DB
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<DbSubcategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    fetch('/api/admin/categories?limit=100&isActive=true')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        const cats = d.categories || [];
        console.log('[AddProduct] Loaded categories:', cats.length);
        setDbCategories(cats);
      })
      .catch(err => {
        console.error('[AddProduct] Failed to load categories:', err);
        setCategoriesError('Failed to load categories. Please refresh the page.');
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (!form.categoryId) { setDbSubcategories([]); return; }
    fetch(`/api/admin/subcategories?categoryId=${form.categoryId}&limit=100&isActive=true`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        const subs = d.subcategories || [];
        console.log('[AddProduct] Loaded subcategories:', subs.length);
        setDbSubcategories(subs);
      })
      .catch(err => console.error('[AddProduct] Failed to load subcategories:', err));
  }, [form.categoryId]);

  const availableSubcategories = useMemo(() => dbSubcategories, [dbSubcategories]);

  const isCategoryValid = !!form.category;
  const isSubcategoryValid = !!form.subcategory;
  const isNameValid = !!form.name;
  const isDescValid = !!form.description;
  const isImageValid = !!form.image;
  const isPriceValid = parseFloat(form.price) > 0;
  const isStockValid = parseInt(form.stock) >= 0 && form.stock !== '';
  const isGstValid = !!form.gstPercent && parseFloat(form.gstPercent) >= 0;
  const isVisible = isCategoryValid && isSubcategoryValid && isNameValid && isPriceValid;
  
  const validCount = [isCategoryValid, isSubcategoryValid, isNameValid, isDescValid, isImageValid, isGstValid, isPriceValid, isVisible].filter(Boolean).length;
  const score = Math.round((validCount / 8) * 100);
  const allValid = validCount === 8;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'category') {
      // Find the selected DB category to get both name/slug and id
      const selected = dbCategories.find(c => c.id === value);
      setForm(prev => ({ ...prev, category: selected?.slug || value, categoryId: value, subcategory: '', subcategoryId: '' }));
    } else if (id === 'subcategory') {
      const selected = dbSubcategories.find(s => s.id === value);
      setForm(prev => ({ ...prev, subcategory: selected?.slug || value, subcategoryId: value }));
    } else {
      setForm(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processProductImage(file);
      setForm(prev => ({ ...prev, image: dataUrl }));
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, video: data.url }));
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      alert(`Failed to upload video: ${(error as Error).message}`);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await processProductImage(files[i]);
        setForm(prev => ({ ...prev, subImages: [...prev.subImages, dataUrl] }));
      } catch (error) {
        console.error('Failed to process sub-image:', error);
      }
    }
  };

  const removeSubImage = (indexToRemove: number) => {
    setForm(prev => ({
      ...prev,
      subImages: prev.subImages.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const addCustomSize = () => {
    const name = customSizeInput.trim();
    if (!name) return;
    if (variants[name]) { alert('That size already exists.'); return; }
    setVariants(prev => {
      const copy = { ...prev, [name]: { weight: '', length: '', width: '', height: '', diameter: '', price: '', stock: '', image: '' } };
      setForm(f => ({ ...f, sizeCategory: Object.keys(copy).join(', ') }));
      return copy;
    });
    setCustomSizeInput('');
  };

  const removeVariant = (size: string) => {
    setVariants(prev => {
      const copy = { ...prev };
      delete copy[size];
      setForm(f => ({ ...f, sizeCategory: Object.keys(copy).join(', ') }));
      return copy;
    });
  };

  const updateVariant = (size: string, field: string, value: string) => {
    setVariants(prev => ({ ...prev, [size]: { ...prev[size], [field]: value } }));
  };

  const addAttribute = () => setAttributes(prev => [...prev, { name: '', value: '' }]);
  const removeAttribute = (idx: number) => setAttributes(prev => prev.filter((_, i) => i !== idx));
  const updateAttribute = (idx: number, field: 'name' | 'value', val: string) => {
    setAttributes(prev => prev.map((attr, i) => i === idx ? { ...attr, [field]: val } : attr));
  };

  const basePrice = parseFloat(form.price) || 0;
  const gst = parseFloat(form.gstPercent) || 0;
  const gstAmount = Math.round(basePrice * gst / 100);
  const finalPrice = basePrice + gstAmount;
  const originalPriceInput = parseFloat(form.originalPrice);
  const originalPrice = originalPriceInput > finalPrice ? originalPriceInput : finalPrice;
  const discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) { alert('Please fill in all required fields correctly.'); return; }
    if (!form.image) { alert('Please upload a product image.'); return; }

    const result = await addProduct({
      name: form.name,
      description: form.description,
      price: basePrice,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      discount: discount,
      gstPercent: gst,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      subcategory: form.subcategory,
      categoryId: form.categoryId || undefined,
      subcategoryId: form.subcategoryId || undefined,
      material: form.material || 'Standard',
      brand: form.brand || undefined,
      shippingFee: form.shippingFee ? parseFloat(form.shippingFee) : undefined,
      shippingMethod: form.shippingMethod || undefined,
      image: form.image,
      subImages: form.subImages,
      video: form.video || undefined,
      rating: parseFloat(form.rating) || 5.0,
      reviewCount: parseInt(form.reviewCount) || 0,
      featured: false,
      height: form.height ? parseFloat(form.height) : undefined,
      width: form.width ? parseFloat(form.width) : undefined,
      length: form.length ? parseFloat(form.length) : undefined,
      diameter: form.diameter ? parseFloat(form.diameter) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      sizeCategory: form.sizeCategory || undefined,
      attributes: attributes.filter(a => a.name.trim() !== '' && a.value.trim() !== ''),
      variants: Object.keys(variants).length > 0 
        ? Object.fromEntries(
            Object.entries(variants).map(([size, data]) => [
              size, 
              { 
                ...data, 
                price: parseFloat(data.price) || 0, 
                stock: parseInt(data.stock) || 0 
              }
            ])
          )
        : undefined,
    });

    if (result.success) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push('/admin/products');
      }, 1500);
    } else {
      alert(`❌ Failed to create product: ${result.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to list a new product</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Categories error banner */}
        {categoriesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            ⚠️ {categoriesError}
          </div>
        )}
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-blue-600" /> Product Information
          </h2>
          <div className="space-y-4">
            <FormInput id="name" label="Product Name" placeholder="e.g. Premium Wireless Headphones" value={form.name} onChange={handleChange} required />
            <FormInput id="description" label="Description" as="textarea" rows={4} placeholder="Describe the product in detail..." value={form.description} onChange={handleChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput id="stock" label="Stock Quantity" type="number" placeholder="e.g. 50" value={form.stock} onChange={handleChange} required />
              <FormInput id="category" label="Category" as="select" value={form.categoryId} onChange={handleChange} required>
                <option value="">
                  {categoriesLoading ? 'Loading categories…' : categoriesError ? 'Error loading categories' : 'Select a category'}
                </option>
                {dbCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormInput>
              <FormInput id="subcategory" label="Subcategory" as="select" value={form.subcategoryId} onChange={handleChange} required>
                <option value="">{form.categoryId ? 'Select subcategory' : 'Select category first'}</option>
                {availableSubcategories.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </FormInput>
              <FormInput id="material" label="Material" placeholder="e.g. Cast Iron, Copper" value={form.material} onChange={handleChange} required />
              <FormInput id="brand" label="Brand" placeholder="e.g. KitchenBay" value={form.brand} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput id="rating" label="Star Rating (0 to 5)" type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" value={form.rating} onChange={handleChange} required />
              <FormInput id="reviewCount" label="Review Count" type="number" placeholder="e.g. 150" value={form.reviewCount} onChange={handleChange} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Product Image <span className="text-red-500 ml-1">*</span></label>
              <div className="flex items-center gap-4">
                {form.image ? (
                  <img src={form.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                    <Upload size={20} />
                  </div>
                )}
                <label className="flex-1 cursor-pointer px-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-center border-dashed border-2">
                  <span className="text-blue-600 font-medium">Click to upload an image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} required={!form.image} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Image will be automatically resized to perfectly match other product cards.</p>
            </div>
            
            {/* Sub Images */}
            <div className="flex flex-col gap-1.5 mt-4 border-t pt-4">
              <label className="text-sm font-medium text-gray-700">Additional Images (Optional)</label>
              <div className="flex items-center gap-4 flex-wrap">
                {form.subImages.map((imgSrc, idx) => (
                  <div key={idx} className="relative group">
                    <img src={imgSrc} alt={`Sub image ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <button 
                      type="button" 
                      onClick={() => removeSubImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 cursor-pointer flex items-center justify-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors border-dashed border-2">
                  <Upload size={20} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleSubImageUpload} />
                </label>
              </div>
            </div>
            
            {/* Product Video */}
            <div className="flex flex-col gap-1.5 mt-4 border-t pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">Product Video (Optional)</label>
              <div className="flex flex-wrap gap-4 items-center">
                {form.video ? (
                  <div className="relative group w-32 h-32">
                    <video src={form.video} className="w-full h-full object-cover rounded-xl border border-gray-200" controls />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, video: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 cursor-pointer flex flex-col items-center justify-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors border-dashed border-2">
                    {videoUploading ? (
                      <span className="text-xs">Uploading...</span>
                    ) : (
                      <>
                        <Upload size={20} className="mb-2" />
                        <span className="text-xs text-center px-2">Upload Video<br/>(MP4, WebM)</span>
                      </>
                    )}
                    <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} disabled={videoUploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" /> Pricing & GST
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <FormInput id="originalPrice" label="MRP (Rs.)" type="number" placeholder="e.g. 1999" value={form.originalPrice} onChange={handleChange} />
            <FormInput id="price" label="Base Price (Rs.)" type="number" placeholder="e.g. 999" value={form.price} onChange={handleChange} required />
            <FormInput id="gstPercent" label="GST Rate (%)" as="select" value={form.gstPercent} onChange={handleChange} required>
              <option value="0">0% — Exempt</option>
              <option value="5">5% — Essential Goods</option>
              <option value="12">12% — Standard</option>
              <option value="18">18% — Standard</option>
              <option value="28">28% — Luxury</option>
            </FormInput>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <FormInput id="shippingFee" label="Shipping Fee (Rs.)" type="number" placeholder="e.g. 99" value={form.shippingFee} onChange={handleChange} />
            <FormInput id="shippingMethod" label="Shipping Method" placeholder="e.g. Standard Delivery" value={form.shippingMethod} onChange={handleChange} />
          </div>

          {/* Live Calculator */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-50 rounded-xl p-5">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calculator size={12} /> Live Price Calculation
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({gst}%)</span>
                <span className="font-medium text-emerald-600">+ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(gstAmount)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Final Price (GST Incl.)</span>
                <span className="text-xl font-bold text-blue-700">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(finalPrice)}</span>
              </div>
              {originalPriceInput > finalPrice && (
                <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">MRP (crossed out)</span>
                  <span className="text-sm line-through text-gray-400">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(originalPrice)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Discount Badge</span>
                  <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{discount}% OFF</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Preview */}
          {form.name && finalPrice > 0 && (
            <div className="mt-5 rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Product Card Preview</p>
              <div className="flex items-start gap-4">
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {form.material && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 inline-block mb-1">
                      {form.material}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{form.name}</p>
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-base font-bold text-gray-900">Rs. {finalPrice.toLocaleString('en-IN')}</span>
                    {originalPriceInput > finalPrice && (
                      <span className="text-sm line-through text-gray-400">Rs. {originalPrice.toLocaleString('en-IN')}</span>
                    )}
                    {discount > 0 && (
                      <span className="text-xs text-green-600 font-semibold">{discount}% off</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dimensions & Sizing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-blue-600" /> Dimensions & Size Variants
          </h2>
          
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">Select Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(variants).map(sz => (
                <span
                  key={sz}
                  className="flex items-center gap-1.5 pl-4 pr-2 py-2 border border-blue-600 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  {sz}
                  <button
                    type="button"
                    onClick={() => removeVariant(sz)}
                    className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${sz} size`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
                placeholder="Type a custom size name e.g. 2.5L, Family Pack"
                className="flex-1 min-w-0 px-3 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-4 py-2 border border-blue-600 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors shrink-0"
              >
                + Add Size
              </button>
            </div>
          </div>

          {Object.keys(variants).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(variants).map(([sz, data]) => (
                <div key={sz} className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center justify-between gap-2">
                    <span>Size: {sz}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(sz)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput id={`weight-${sz}`} label="Weight (kg/g)" placeholder="e.g. 1.5" type="number" value={data.weight} onChange={(e) => updateVariant(sz, 'weight', e.target.value)} />
                    <FormInput id={`length-${sz}`} label="Length (cm)" placeholder="e.g. 20" type="number" value={data.length} onChange={(e) => updateVariant(sz, 'length', e.target.value)} />
                    <FormInput id={`width-${sz}`} label="Width (cm)" placeholder="e.g. 15" type="number" value={data.width} onChange={(e) => updateVariant(sz, 'width', e.target.value)} />
                    <FormInput id={`height-${sz}`} label="Height (cm)" placeholder="e.g. 10" type="number" value={data.height} onChange={(e) => updateVariant(sz, 'height', e.target.value)} />
                    <FormInput id={`diameter-${sz}`} label="Diameter (cm)" placeholder="e.g. 12" type="number" value={data.diameter} onChange={(e) => updateVariant(sz, 'diameter', e.target.value)} />
                    <FormInput id={`price-${sz}`} label="Price Override (Rs.)" placeholder="Optional base price" type="number" value={data.price} onChange={(e) => updateVariant(sz, 'price', e.target.value)} />
                    <FormInput id={`stock-${sz}`} label="Stock Override" placeholder="Optional" type="number" value={data.stock} onChange={(e) => updateVariant(sz, 'stock', e.target.value)} />
                    
                    {/* Size Specific Image Upload */}
                    <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700">Size Variant Image</label>
                      {data.image ? (
                        <div className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl">
                          <img src={data.image} className="w-12 h-12 object-contain rounded-lg border bg-gray-50 shrink-0" alt={`${sz} variant`} />
                          <button 
                            type="button" 
                            onClick={() => updateVariant(sz, 'image', '')}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await processProductImage(file);
                              updateVariant(sz, 'image', dataUrl);
                            } catch (error) {
                              console.error(error);
                              alert('Failed to process image');
                            }
                          }}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-4">No specific sizes selected. You can provide general dimensions for the product below.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput id="weight" label="Weight (kg/g)" placeholder="e.g. 1.5" type="number" value={form.weight} onChange={handleChange} />
                <FormInput id="length" label="Length (cm)" placeholder="e.g. 20" type="number" value={form.length} onChange={handleChange} />
                <FormInput id="width" label="Width / Breadth (cm)" placeholder="e.g. 15" type="number" value={form.width} onChange={handleChange} />
                <FormInput id="height" label="Height (cm)" placeholder="e.g. 10" type="number" value={form.height} onChange={handleChange} />
                <FormInput id="diameter" label="Diameter (cm)" placeholder="e.g. 12" type="number" value={form.diameter} onChange={handleChange} />
              </div>
            </>
          )}
        </div>

        {/* Dynamic Attributes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-blue-600" /> Custom Attributes
          </h2>
          <p className="text-xs text-gray-500 mb-4">Add custom key-value pairs like Capacity (Liters), Color, Finish, or Pattern.</p>
          
          <div className="space-y-3 mb-4">
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. Capacity (Liters)" 
                  value={attr.name} 
                  onChange={(e) => updateAttribute(idx, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input 
                  type="text" 
                  placeholder="e.g. 2L" 
                  value={attr.value} 
                  onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button 
                  type="button" 
                  onClick={() => removeAttribute(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addAttribute}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            + Add Attribute
          </button>
        </div>

        {/* Validation Checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" /> Product Validation Checklist
          </h2>
          
          {(!isCategoryValid || !isSubcategoryValid) && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-sm font-medium mb-4">
              Please select Category and Subcategory.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm font-medium">
            <div className={`flex items-center gap-2 ${isCategoryValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isCategoryValid ? '✅' : '❌'} Category Selected
            </div>
            <div className={`flex items-center gap-2 ${isSubcategoryValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isSubcategoryValid ? '✅' : '❌'} Subcategory Selected
            </div>
            <div className={`flex items-center gap-2 ${isNameValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isNameValid ? '✅' : '❌'} Product Name Added
            </div>
            <div className={`flex items-center gap-2 ${isDescValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isDescValid ? '✅' : '❌'} Description Added
            </div>
            <div className={`flex items-center gap-2 ${isImageValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isImageValid ? '✅' : '❌'} Images Uploaded
            </div>
            <div className={`flex items-center gap-2 ${isGstValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isGstValid ? '✅' : '❌'} GST Status: {isGstValid ? 'Valid' : 'Missing'}
            </div>
            <div className={`flex items-center gap-2 ${isPriceValid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isPriceValid ? '✅' : '❌'} Pricing Valid
            </div>
            <div className={`flex items-center gap-2 ${isVisible ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isVisible ? '✅' : '❌'} Product Visible in UI
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-gray-700">Health Score</span>
              <span className={score === 100 ? 'text-emerald-600' : 'text-blue-600'}>{score}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${score}%` }}></div>
            </div>
          </div>

          {allValid ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm flex items-start gap-3 border border-emerald-100">
              <div className="text-xl">🎉</div>
              <div>
                <strong className="block text-base mb-1">Product Validation Passed</strong>
                <p>This product is properly configured and visible across the storefront.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100">
              <div className="text-xl">⚠</div>
              <div>
                <strong className="block text-base mb-2">Product Validation Failed</strong>
                <p className="font-semibold mb-1">Missing Items:</p>
                <ul className="list-disc ml-5 mb-2 space-y-1">
                  {!isGstValid && <li>GST Percentage</li>}
                  {!isImageValid && <li>Product Images</li>}
                  {!isSubcategoryValid && <li>Subcategory</li>}
                  {!isCategoryValid && <li>Category</li>}
                  {!isNameValid && <li>Product Name</li>}
                  {!isDescValid && <li>Description</li>}
                  {!isPriceValid && <li>Price</li>}
                </ul>
                <p className="text-red-700 font-medium">Please complete all required fields before publishing.</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!allValid}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all text-sm ${
              saved
                ? 'bg-emerald-500 text-white'
                : !allValid
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {saved ? <><Check size={16} /> Product Saved!</> : <><Upload size={16} /> Save Product</>}
          </button>
          <button type="button" className="px-6 py-3 border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
