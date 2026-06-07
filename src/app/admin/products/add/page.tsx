'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */


import { useState, useMemo, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { useProducts } from '@/lib/productsContext';
import { Package, Calculator, Check, Upload, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DbCategory { id: string; name: string; slug: string; }
interface DbSubcategory { id: string; name: string; categoryId: string; }

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '', gstPercent: '18',
    stock: '', category: '', subcategory: '', categoryId: '', subcategoryId: '',
    material: '', image: '', rating: '5.0', reviewCount: '0'
  });
  const [saved, setSaved] = useState(false);

  // Dynamic categories/subcategories from DB
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<DbSubcategory[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories?limit=100&isActive=true')
      .then(r => r.json())
      .then(d => setDbCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.categoryId) { setDbSubcategories([]); return; }
    fetch(`/api/admin/subcategories?categoryId=${form.categoryId}&limit=100`)
      .then(r => r.json())
      .then(d => setDbSubcategories(d.subcategories || []))
      .catch(() => {});
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
      setForm(prev => ({ ...prev, subcategory: selected?.name || value, subcategoryId: value }));
    } else {
      setForm(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setForm(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const basePrice = parseFloat(form.price) || 0;
  const gst = parseFloat(form.gstPercent) || 0;
  const gstAmount = Math.round(basePrice * gst / 100);
  const finalPrice = basePrice + gstAmount;
  const originalPriceInput = parseFloat(form.originalPrice);
  const originalPrice = originalPriceInput > finalPrice ? originalPriceInput : finalPrice;
  const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  const formatPrice = (p: number) =>
    p > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)
      : '—';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) return;

    addProduct({
      name: form.name,
      description: form.description,
      price: basePrice,
      originalPrice: originalPriceInput > 0 ? originalPriceInput : finalPrice,
      finalPrice: finalPrice,
      discount: discount,
      gstPercent: gst,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      subcategory: form.subcategory,
      material: form.material || 'Standard',
      image: form.image,
      rating: parseFloat(form.rating) || 5.0,
      reviewCount: parseInt(form.reviewCount) || 0,
      featured: false,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/admin/products');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to list a new product</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
                <option value="">Select a category</option>
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
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" /> Pricing & GST
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <FormInput id="originalPrice" label="MRP (₹)" type="number" placeholder="e.g. 1999" value={form.originalPrice} onChange={handleChange} />
            <FormInput id="price" label="Base Price (₹)" type="number" placeholder="e.g. 999" value={form.price} onChange={handleChange} required />
            <FormInput id="gstPercent" label="GST Rate (%)" as="select" value={form.gstPercent} onChange={handleChange} required>
              <option value="0">0% — Exempt</option>
              <option value="5">5% — Essential Goods</option>
              <option value="12">12% — Standard</option>
              <option value="18">18% — Standard</option>
              <option value="28">28% — Luxury</option>
            </FormInput>
          </div>

          {/* Live Calculator */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-50 rounded-xl p-5">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calculator size={12} /> Live Price Calculation
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-800">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({gst}%)</span>
                <span className="font-medium text-emerald-600">+ {formatPrice(gstAmount)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Final Price (GST Incl.)</span>
                <span className="text-xl font-bold text-blue-700">{formatPrice(finalPrice)}</span>
              </div>
              {originalPriceInput > finalPrice && (
                <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">MRP (crossed out)</span>
                  <span className="text-sm line-through text-gray-400">{formatPrice(originalPrice)}</span>
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
                    <span className="text-base font-bold text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</span>
                    {originalPriceInput > finalPrice && (
                      <span className="text-sm line-through text-gray-400">₹{originalPrice.toLocaleString('en-IN')}</span>
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

        {/* Validation Checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" /> Product Validation Checklist
          </h2>
          
          {(!isCategoryValid || !isSubcategoryValid) && (
            <div className="text-red-600 font-medium text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
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
