'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, Type, Search, Check, X, Loader2 } from 'lucide-react';
import { useProducts } from '@/lib/productsContext';

export default function AdminVideos() {
  const { products } = useProducts();
  const [videos, setVideos] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', videoUrl: '', thumbnail: '', link: '' });
  
  // File upload and product search states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    if (res.ok) {
      setVideos(await res.json());
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit base64 upload to 10MB to maintain database storage and connection efficiency
    if (file.size > 10 * 1024 * 1024) {
      alert('Video file is too large! Please upload a video under 10MB to maintain optimal performance.');
      return;
    }

    setUploadingVideo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, videoUrl: event.target?.result as string }));
      setUploadingVideo(false);
    };
    reader.onerror = () => {
      alert('Failed to read video file!');
      setUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, thumbnail: event.target?.result as string }));
      setUploadingThumbnail(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file!');
      setUploadingThumbnail(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/videos/${formData.id}` : '/api/videos';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      handleCancel();
      fetchVideos();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchVideos();
    }
  };

  const handleEdit = (video: any) => {
    setFormData({
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || '',
      link: video.link || ''
    });

    // Resolve search term value if linked to a standard catalog product
    if (video.link && video.link.startsWith('/products/')) {
      const prodId = video.link.replace('/products/', '');
      const linkedProd = products.find(p => p.id === prodId);
      if (linkedProd) {
        setSearchTerm(linkedProd.name);
      } else {
        setSearchTerm(video.link);
      }
    } else {
      setSearchTerm(video.link || '');
    }

    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ id: '', title: '', videoUrl: '', thumbnail: '', link: '' });
    setSearchTerm('');
    setShowDropdown(false);
    setIsEditing(false);
  };

  // Filter products for searchable dropdown
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Retrieve linked product preview information
  const getLinkedProduct = () => {
    if (!formData.link || !formData.link.startsWith('/products/')) return null;
    const prodId = formData.link.replace('/products/', '');
    return products.find(p => p.id === prodId);
  };

  const linkedProduct = getLinkedProduct();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tradition Videos</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove tradition-showcase videos from the homepage.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Video
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">
            {formData.id ? 'Edit Video Details' : 'Add New Tradition Video'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Video Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Type size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm border p-3 outline-none"
                  placeholder="e.g. Making Soapstone Cookware"
                />
              </div>
            </div>

            {/* Product Link (Searchable Dropdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Linked Product</label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search to link product..."
                      value={searchTerm}
                      onFocus={() => setShowDropdown(true)}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      className="pl-10 pr-8 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm border p-3 outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setFormData({ ...formData, link: '' });
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown List */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-150 shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-gray-500">No products found matching "{searchTerm}"</div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {filteredProducts.map(prod => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, link: `/products/${prod.id}` });
                                setSearchTerm(prod.name);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                            >
                              <img src={prod.image} alt={prod.name} className="w-8 h-8 object-cover rounded border" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{prod.name}</p>
                                <p className="text-xs text-gray-400 capitalize">{prod.category} • ₹{new Intl.NumberFormat('en-IN').format(prod.finalPrice)}</p>
                              </div>
                              {formData.link === `/products/${prod.id}` && (
                                <Check size={16} className="text-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Video File Upload & URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 font-semibold">Video File Source</label>
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center text-sm">
                  {uploadingVideo ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-gray-500 font-medium">Processing video file...</span>
                    </>
                  ) : (
                    <>
                      <VideoIcon size={16} className="text-blue-600" />
                      <span className="text-blue-600 font-semibold">Choose local MP4 file</span>
                    </>
                  )}
                  <input type="file" accept="video/mp4" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="pl-9 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs border p-2.5 outline-none"
                    placeholder="Or paste custom video URL (.mp4)"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Upload & URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 font-semibold">Thumbnail Image Source</label>
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center text-sm">
                  {uploadingThumbnail ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-gray-500 font-medium">Processing image file...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} className="text-blue-600" />
                      <span className="text-blue-600 font-semibold">Choose local image file</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="pl-9 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs border p-2.5 outline-none"
                    placeholder="Or paste custom thumbnail image URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Linked Product Preview Card */}
          {linkedProduct && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <img src={linkedProduct.image} alt={linkedProduct.name} className="w-12 h-12 object-cover rounded-lg border border-blue-200" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-blue-600 tracking-wider">LINKED PRODUCT PREVIEW</p>
                <p className="text-sm font-bold text-gray-900 truncate">{linkedProduct.name}</p>
                <p className="text-xs text-gray-400 truncate">Linked path: <code className="bg-white/80 px-1 py-0.5 rounded border text-[11px] font-mono">{formData.link}</code></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">₹{new Intl.NumberFormat('en-IN').format(linkedProduct.finalPrice)}</p>
                <p className="text-[10px] text-gray-400 capitalize">{linkedProduct.category}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingVideo || uploadingThumbnail}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {formData.id ? 'Update Video' : 'Add Video'}
            </button>
          </div>
        </form>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((v: any) => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group relative">
            <div className="aspect-[9/16] bg-black relative">
              <video 
                src={v.videoUrl} 
                poster={v.thumbnail || undefined} 
                className="w-full h-full object-cover" 
                muted loop playsInline 
                onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                onMouseLeave={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.pause();
                    video.currentTime = 0;
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleEdit(v)}
                  className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center hover:scale-115 transition-transform shadow-md"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-115 transition-transform shadow-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                {v.link && <p className="text-xs text-blue-600 truncate font-medium">{v.link}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {videos.length === 0 && !isEditing && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <VideoIcon size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No tradition videos added yet</p>
          <p className="text-gray-400 text-sm mt-1">Click the "Add Video" button to upload your first story.</p>
        </div>
      )}
    </div>
  );
}
