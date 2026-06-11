'use client';

import { useState } from 'react';
import { X, Save, Plus, Trash, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useProducts } from '@/lib/productsContext';

interface CMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  sectionId: string;
  sectionTitle: string;
  initialData: any[]; 
  schema: { key: string, label: string, type?: 'text' | 'image' | 'number' | 'product-link' }[];
  pageName?: string;
}

export default function CMSModal({ isOpen, onClose, onSaveSuccess, sectionId, sectionTitle, initialData, schema, pageName = 'home' }: CMSModalProps) {
  const { products } = useProducts();
  const [data, setData] = useState<any[]>([...initialData]);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<{index: number, key: string} | null>(null);
  const [productSearch, setProductSearch] = useState<{[key: string]: string}>({});
  const [activeSearch, setActiveSearch] = useState<{index: number, key: string} | null>(null);

  if (!isOpen) return null;

  const handleChange = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const addItem = () => {
    const newItem: any = {};
    schema.forEach(s => newItem[s.key] = '');
    setData([...data, newItem]);
  };

  const removeItem = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const handleImageUpload = async (index: number, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField({ index, key: field });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const resData = await res.json();
      if (resData.success) {
        handleChange(index, field, resData.url);
      } else {
        throw new Error(resData.error);
      }
    } catch (error: any) {
      Swal.fire('Upload Failed', error.message, 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleProductSelect = (index: number, field: string, productId: string) => {
    handleChange(index, field, `/products/${productId}`);
    setActiveSearch(null);
    setProductSearch(prev => ({...prev, [`${index}-${field}`]: `/products/${productId}`}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          page: pageName,
          section: 'hero', // Assuming hero for now, can be parameterized
          key: sectionId,
          value: JSON.stringify(data),
          type: 'JSON'
        }
      ];

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      const result = await res.json();
      if (result.success) {
        Swal.fire('Saved!', 'Content has been published successfully.', 'success');
        onSaveSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to save content', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Editing: {sectionTitle}</h3>
            <p className="text-xs text-gray-500 mt-1">Make changes directly to your live site.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          <div className="flex justify-end">
             <button onClick={addItem} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors shadow-sm">
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group shadow-sm">
                <button onClick={() => removeItem(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1.5 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {schema.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
                      
                      {field.type === 'image' ? (
                        <div className="flex items-center gap-3">
                          {item[field.key] && (
                            <img src={item[field.key]} alt="preview" className="w-10 h-10 object-cover rounded border border-gray-200" />
                          )}
                          <div className="relative flex-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(idx, field.key, e)} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center justify-between transition-colors shadow-sm cursor-pointer">
                              <span className="truncate text-gray-500">
                                {uploadingField?.index === idx && uploadingField?.key === field.key ? 'Uploading...' : (item[field.key] ? 'Change Image' : 'Upload Image')}
                              </span>
                              {(uploadingField?.index === idx && uploadingField?.key === field.key) ? (
                                <Loader2 size={16} className="animate-spin text-blue-500" />
                              ) : (
                                <Plus size={16} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ) : field.type === 'product-link' ? (
                        <div className="relative">
                          <input 
                            type="text" 
                            value={productSearch[`${idx}-${field.key}`] !== undefined ? productSearch[`${idx}-${field.key}`] : (item[field.key] || '')} 
                            onChange={(e) => {
                              handleChange(idx, field.key, e.target.value);
                              setProductSearch(prev => ({...prev, [`${idx}-${field.key}`]: e.target.value}));
                            }} 
                            onFocus={() => setActiveSearch({index: idx, key: field.key})}
                            onBlur={() => setTimeout(() => setActiveSearch(null), 200)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                            placeholder={`Search product or enter URL...`}
                          />
                          {activeSearch?.index === idx && activeSearch?.key === field.key && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {products.filter(p => p.name.toLowerCase().includes((productSearch[`${idx}-${field.key}`] || item[field.key] || '').toLowerCase())).map(p => (
                                <div 
                                  key={p.id} 
                                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                  onMouseDown={(e) => { e.preventDefault(); handleProductSelect(idx, field.key, p.id); }}
                                >
                                  {p.image && <img src={p.image} alt={p.name} className="w-6 h-6 object-cover rounded" />}
                                  <span className="truncate">{p.name}</span>
                                </div>
                              ))}
                              {products.filter(p => p.name.toLowerCase().includes((productSearch[`${idx}-${field.key}`] || item[field.key] || '').toLowerCase())).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input 
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={item[field.key] || ''} 
                          onChange={(e) => handleChange(idx, field.key, e.target.value)} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                No items found. Click "Add Item" to start.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Publish Changes
          </button>
        </div>
      </div>
    </div>
  );
}
