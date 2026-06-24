'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, Star, X, Upload, ShieldCheck } from 'lucide-react';
import { useProducts } from '@/lib/productsContext';
import { categories, subcategories, Product } from '@/lib/mockData';

export default function AdminProductsPage() {
  const { products, toggleFeatured, deleteProduct, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      const result = await deleteProduct(id);
      if (result.success) {
        alert('✅ Product deleted successfully.');
      } else {
        alert(`❌ Failed to delete product: ${result.message}`);
      }
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingProduct) return;
    const { id, value } = e.target;
    
    setEditingProduct(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, [id]: value };
      
      if (id === 'price' || id === 'gstPercent' || id === 'originalPrice') {
        const bp = parseFloat(id === 'price' ? value : String(prev.price)) || 0;
        const gp = parseFloat(id === 'gstPercent' ? value : String(prev.gstPercent)) || 0;
        const opInput = parseFloat(id === 'originalPrice' ? value : String(prev.originalPrice)) || 0;
        const gstAmt = Math.round(bp * gp / 100);
        updated.price = bp;
        updated.gstPercent = gp;
        updated.finalPrice = bp + gstAmt;
        updated.originalPrice = opInput > updated.finalPrice ? opInput : updated.finalPrice;
        updated.discount = updated.originalPrice > updated.finalPrice ? Math.round(((updated.originalPrice - updated.finalPrice) / updated.originalPrice) * 100) : 0;
      } else if (id === 'stock') {
        updated.stock = parseInt(value) || 0;
      } else if (id === 'rating') {
        updated.rating = parseFloat(value) || 0;
      } else if (id === 'reviewCount') {
        updated.reviewCount = parseInt(value) || 0;
      }
      
      return updated;
    });
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditingProduct(prev => prev ? { ...prev, image: dataUrl } : null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
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
          setEditingProduct(prev => {
            if (!prev) return null;
            return { ...prev, subImages: [...(prev.subImages || []), dataUrl] };
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditSubImage = (indexToRemove: number) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        subImages: (prev.subImages || []).filter((_, idx) => idx !== indexToRemove)
      };
    });
  };

  const toggleEditSize = (sz: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentVariants = (prev.variants as any) || {};
      const copy = { ...currentVariants };
      if (copy[sz]) delete copy[sz];
      else copy[sz] = { weight: '', length: '', width: '', height: '', diameter: '', price: '', stock: '' };
      
      const newSizes = Object.keys(copy).join(', ');
      return { ...prev, variants: copy, sizeCategory: newSizes };
    });
  };

  const updateEditVariant = (sz: string, field: string, value: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentVariants = (prev.variants as any) || {};
      return {
        ...prev,
        variants: {
          ...currentVariants,
          [sz]: { ...currentVariants[sz], [field]: value }
        }
      };
    });
  };

  const availableSubcategories = editingProduct 
    ? subcategories.filter(s => s.category === editingProduct.category) 
    : [];

  const isCategoryValid = !!editingProduct?.category;
  const isSubcategoryValid = !!editingProduct?.subcategory;
  const isNameValid = !!editingProduct?.name;
  const isDescValid = !!editingProduct?.description;
  const isImageValid = !!editingProduct?.image;
  const isPriceValid = editingProduct ? editingProduct.price > 0 : false;
  const isStockValid = editingProduct ? editingProduct.stock >= 0 : false;
  const isGstValid = editingProduct ? editingProduct.gstPercent >= 0 : false;
  const isVisible = isCategoryValid && isSubcategoryValid && isNameValid && isPriceValid;
  
  const validCount = [isCategoryValid, isSubcategoryValid, isNameValid, isDescValid, isImageValid, isGstValid, isPriceValid, isVisible].filter(Boolean).length;
  const score = Math.round((validCount / 8) * 100);
  const allValid = validCount === 8;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Ensure variants have numeric price and stock before saving
      let processedVariants = editingProduct.variants;
      if (processedVariants && Object.keys(processedVariants).length > 0) {
        processedVariants = Object.fromEntries(
          Object.entries(processedVariants as Record<string, any>).map(([sz, data]) => [
            sz,
            { ...data, price: parseFloat(data.price) || 0, stock: parseInt(data.stock) || 0 }
          ])
        );
      } else {
        processedVariants = undefined;
      }

      const payload = {
        ...editingProduct,
        variants: processedVariants
      };

      const result = await updateProduct(editingProduct.id, payload);
      if (result.success) {
        setEditingProduct(null);
        alert('✅ Product updated successfully.');
      } else {
        alert(`❌ Failed to update product: ${result.message}`);
      }
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filteredProducts.length} products listed</p>
        </div>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, category, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm text-gray-700 outline-none placeholder:text-gray-400 flex-1 w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Base Price', 'GST %', 'Final Price', 'Stock', 'Rating', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-500 text-sm">
                    No products found matching your search query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                            {p.isActive === false && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">Paused</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.description.slice(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full capitalize">{p.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.gstPercent === 0 ? 'text-gray-600 bg-gray-100' : 'text-emerald-700 bg-emerald-50'}`}>
                        {p.gstPercent}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatPrice(p.finalPrice)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold ${p.stock < 20 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      <span className="text-amber-500">⭐</span> {p.rating}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      <button 
                        onClick={() => toggleFeatured(p.id)} 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.featured ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        title={p.featured ? "Unfeature" : "Feature on Homepage"}
                      >
                        <Star size={16} fill={p.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingProduct(p)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center transition-colors" 
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 flex-1">
              <div className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    id="name"
                    type="text"
                    value={editingProduct.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={editingProduct.description}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                {/* Status / Visibility */}
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={editingProduct.isActive !== false} 
                      onChange={(e) => setEditingProduct(prev => prev ? {...prev, isActive: e.target.checked} : null)} 
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Active / Visible to Customers</p>
                    <p className="text-xs text-gray-500">Turn this off to pause the product and show &quot;Currently Unavailable&quot;</p>
                  </div>
                </div>

                {/* Stock & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      id="stock"
                      type="number"
                      value={editingProduct.stock}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      id="category"
                      value={editingProduct.category}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="subcategory" className="text-sm font-medium text-gray-700">Subcategory</label>
                    <select
                      id="subcategory"
                      value={editingProduct.subcategory}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    >
                      <option value="">Select subcategory</option>
                      {availableSubcategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="material" className="text-sm font-medium text-gray-700">Material</label>
                    <input
                      id="material"
                      type="text"
                      placeholder="e.g. Cast Iron, Copper"
                      value={editingProduct.material}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rating" className="text-sm font-medium text-gray-700">Star Rating (0 to 5)</label>
                    <input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editingProduct.rating}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reviewCount" className="text-sm font-medium text-gray-700">Review Count</label>
                    <input
                      id="reviewCount"
                      type="number"
                      value={editingProduct.reviewCount}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="originalPrice" className="text-sm font-medium text-gray-700">MRP (₹)</label>
                    <input
                      id="originalPrice"
                      type="number"
                      value={editingProduct.originalPrice}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="price" className="text-sm font-medium text-gray-700">Base Price (₹)</label>
                    <input
                      id="price"
                      type="number"
                      value={editingProduct.price}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gstPercent" className="text-sm font-medium text-gray-700">GST Rate (%)</label>
                    <select
                      id="gstPercent"
                      value={editingProduct.gstPercent}
                      onChange={handleEditChange}
                      required
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    >
                      <option value="0">0% — Exempt</option>
                      <option value="5">5% — Essential</option>
                      <option value="12">12% — Standard</option>
                      <option value="18">18% — Standard</option>
                      <option value="28">28% — Luxury</option>
                    </select>
                  </div>
                </div>

                {/* Calculated Final Price */}
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-50 flex items-center justify-between text-sm">
                  <span className="font-semibold text-blue-700">Calculated Final Price (GST Incl.):</span>
                  <span className="font-bold text-violet-900 text-lg">{formatPrice(editingProduct.finalPrice)}</span>
                </div>

                {/* Dimensions & Size Variants */}
                <div className="pt-2">
                  <h3 className="font-semibold text-gray-800 mb-3">Dimensions & Size Variants</h3>
                  
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Select Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard', 'Custom'].map(sz => {
                        const isSelected = !!((editingProduct.variants as any)?.[sz]);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleEditSize(sz)}
                            className={`px-4 py-2 border rounded-xl text-sm font-bold shadow-sm transition-colors ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-600 text-white' 
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {Object.keys((editingProduct.variants as any) || {}).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries((editingProduct.variants as any) || {}).map(([sz, data]: any) => (
                        <div key={sz} className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            Size: {sz}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Weight</label><input type="number" value={data.weight || ''} onChange={(e) => updateEditVariant(sz, 'weight', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Length</label><input type="number" value={data.length || ''} onChange={(e) => updateEditVariant(sz, 'length', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Width</label><input type="number" value={data.width || ''} onChange={(e) => updateEditVariant(sz, 'width', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Height</label><input type="number" value={data.height || ''} onChange={(e) => updateEditVariant(sz, 'height', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Diameter</label><input type="number" value={data.diameter || ''} onChange={(e) => updateEditVariant(sz, 'diameter', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Price Override</label><input type="number" value={data.price || ''} onChange={(e) => updateEditVariant(sz, 'price', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-gray-700">Stock Override</label><input type="number" value={data.stock || ''} onChange={(e) => updateEditVariant(sz, 'stock', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-4">No specific sizes selected. You can provide general dimensions for the product below.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg/g)</label>
                          <input id="weight" type="number" placeholder="e.g. 1.5" value={editingProduct.weight ?? ''} onChange={handleEditChange} className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="length" className="text-sm font-medium text-gray-700">Length (cm)</label>
                          <input id="length" type="number" placeholder="e.g. 20" value={editingProduct.length ?? ''} onChange={handleEditChange} className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="width" className="text-sm font-medium text-gray-700">Width (cm)</label>
                          <input id="width" type="number" placeholder="e.g. 15" value={editingProduct.width ?? ''} onChange={handleEditChange} className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="height" className="text-sm font-medium text-gray-700">Height (cm)</label>
                          <input id="height" type="number" placeholder="e.g. 10" value={editingProduct.height ?? ''} onChange={handleEditChange} className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="diameter" className="text-sm font-medium text-gray-700">Diameter (cm)</label>
                          <input id="diameter" type="number" placeholder="e.g. 12" value={editingProduct.diameter ?? ''} onChange={handleEditChange} className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Image Upload Option */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Product Image</label>
                  <div className="flex items-center gap-4">
                    {editingProduct.image ? (
                      <img src={editingProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                        <Upload size={18} />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-center border-dashed border-2">
                      <span className="text-blue-600 font-medium">Click to upload new image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Sub Images Upload Option */}
                <div className="flex flex-col gap-1.5 mt-2 pt-4 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700">Additional Images (Optional)</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {(editingProduct.subImages || []).map((imgSrc, idx) => (
                      <div key={idx} className="relative group">
                        <img src={imgSrc} alt={`Sub image ${idx + 1}`} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                        <button 
                          type="button" 
                          onClick={() => removeEditSubImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 cursor-pointer flex items-center justify-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors border-dashed border-2">
                      <Upload size={18} />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditSubImageUpload} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6">
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

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={!allValid}
                  className={`px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg flex-1 font-semibold ${allValid ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-200' : 'bg-gray-400 text-white cursor-not-allowed shadow-none'}`}
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
