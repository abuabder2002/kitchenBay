'use client';

import { useState, useMemo } from 'react';
import FormInput from '@/components/FormInput';
import { categories } from '@/lib/mockData';
import { useProducts } from '@/lib/productsContext';
import { Package, Calculator, Check, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();
  const [form, setForm] = useState({
    name: '', description: '', price: '', gstPercent: '18',
    stock: '', category: '', image: '', rating: '5.0', reviewCount: '0'
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
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
      originalPrice: finalPrice,
      finalPrice: finalPrice,
      discount: 0,
      gstPercent: gst,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      subcategory: form.category,
      material: 'Standard',
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput id="stock" label="Stock Quantity" type="number" placeholder="e.g. 50" value={form.stock} onChange={handleChange} required />
              <FormInput id="category" label="Category" as="select" value={form.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormInput>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <FormInput id="price" label="Base Price (₹)" type="number" placeholder="e.g. 7999" value={form.price} onChange={handleChange} required />
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
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all text-sm ${
              saved
                ? 'bg-emerald-500 text-white'
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
