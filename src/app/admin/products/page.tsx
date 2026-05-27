'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, Star, X, Upload } from 'lucide-react';
import { useProducts } from '@/lib/productsContext';
import { categories, Product } from '@/lib/mockData';

export default function AdminProductsPage() {
  const { products, toggleFeatured, deleteProduct, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingProduct) return;
    const { id, value } = e.target;
    
    setEditingProduct(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, [id]: value };
      
      if (id === 'price' || id === 'gstPercent') {
        const bp = parseFloat(id === 'price' ? value : String(prev.price)) || 0;
        const gp = parseFloat(id === 'gstPercent' ? value : String(prev.gstPercent)) || 0;
        const gstAmt = Math.round(bp * gp / 100);
        updated.price = bp;
        updated.gstPercent = gp;
        updated.finalPrice = bp + gstAmt;
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
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
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
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

                {/* Stock & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-200 flex-1"
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
