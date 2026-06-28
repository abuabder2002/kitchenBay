'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Product } from '@/lib/mockData';

interface LinkSelectorProps {
  value: string;
  onChange: (val: string) => void;
  products: Product[];
  placeholder?: string;
}

type LinkType = 'Product' | 'Category' | 'Collection' | 'Custom URL';

export default function LinkSelector({ value, onChange, products, placeholder }: LinkSelectorProps) {
  const [linkType, setLinkType] = useState<LinkType>('Custom URL');
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const [collections, setCollections] = useState<{name: string, slug: string}[]>([]);

  useEffect(() => {
    if (!isInitialized && value) {
      if (value.startsWith('/products/') && value.split('/').length === 3 && !value.includes('?')) {
        setLinkType('Product');
      } else if (value.startsWith('/products?category=')) {
        setLinkType('Category');
      } else if (value.startsWith('/products?subcategory=')) {
        setLinkType('Collection');
      } else {
        setLinkType('Custom URL');
      }
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  useEffect(() => {
    fetch('/api/admin/categories?limit=100').then(res => res.json()).then(data => {
      if (data.categories) setCategories(data.categories);
    }).catch(e => console.error(e));

    fetch('/api/admin/subcategories?limit=100').then(res => res.json()).then(data => {
      if (data.subcategories) setCollections(data.subcategories);
    }).catch(e => console.error(e));
  }, []);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedProduct = useMemo(() => {
    if (linkType === 'Product' && value.startsWith('/products/')) {
      const id = value.split('/').pop();
      return products.find(p => p.id === id);
    }
    return null;
  }, [value, linkType, products]);

  const selectedCategory = useMemo(() => {
    if (linkType === 'Category' && value.startsWith('/products?category=')) {
      const slug = value.split('category=')[1];
      return categories.find(c => c.slug === slug || c.name.toLowerCase() === slug);
    }
    return null;
  }, [value, linkType, categories]);

  const selectedCollection = useMemo(() => {
    if (linkType === 'Collection' && value.startsWith('/products?subcategory=')) {
      const slug = value.split('subcategory=')[1];
      return collections.find(c => c.slug === slug || c.name.toLowerCase() === slug);
    }
    return null;
  }, [value, linkType, collections]);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(s) || 
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.category && p.category.toLowerCase().includes(s)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(s))
    );
  }, [products, search]);

  const filteredCategories = useMemo(() => {
    const s = search.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(s));
  }, [categories, search]);

  const filteredCollections = useMemo(() => {
    const s = search.toLowerCase();
    return collections.filter(c => c.name.toLowerCase().includes(s));
  }, [collections, search]);

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2">
        {(['Product', 'Category', 'Collection', 'Custom URL'] as LinkType[]).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setLinkType(type);
              setSearch('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              linkType === type 
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative">
        {linkType === 'Custom URL' ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. /about or https://example.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={`Search ${linkType.toLowerCase()}...`}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
                
                {linkType === 'Product' && (
                  <>
                    {filteredProducts.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          onChange(`/products/${p.id}`);
                          setSearch('');
                          setIsOpen(false);
                        }}
                        className="px-3 py-2 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex gap-3 items-center"
                      >
                        {p.image && <img src={p.image} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-100" alt="" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {p.category} {p.subcategory ? `> ${p.subcategory}` : ''} {p.sku ? `| SKU: ${p.sku}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && <div className="p-3 text-sm text-gray-500">No products found</div>}
                  </>
                )}

                {linkType === 'Category' && (
                  <>
                    {filteredCategories.map(c => (
                      <div 
                        key={c.slug}
                        onClick={() => {
                          onChange(`/products?category=${c.slug}`);
                          setSearch('');
                          setIsOpen(false);
                        }}
                        className="px-3 py-2 border-b border-gray-50 hover:bg-blue-50 cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      </div>
                    ))}
                    {filteredCategories.length === 0 && <div className="p-3 text-sm text-gray-500">No categories found</div>}
                  </>
                )}

                {linkType === 'Collection' && (
                  <>
                    {filteredCollections.map(c => (
                      <div 
                        key={c.slug}
                        onClick={() => {
                          onChange(`/products?subcategory=${c.slug}`);
                          setSearch('');
                          setIsOpen(false);
                        }}
                        className="px-3 py-2 border-b border-gray-50 hover:bg-blue-50 cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      </div>
                    ))}
                    {filteredCollections.length === 0 && <div className="p-3 text-sm text-gray-500">No collections found</div>}
                  </>
                )}
                
              </div>
            )}
          </div>
        )}
      </div>

      {linkType === 'Product' && selectedProduct && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
           {selectedProduct.image && <img src={selectedProduct.image} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-100" alt="" />}
           <div className="flex-1 min-w-0">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Selected Product</p>
             <p className="text-sm font-bold text-gray-900 truncate">{selectedProduct.name}</p>
             <p className="text-xs text-blue-600 truncate">{value}</p>
           </div>
        </div>
      )}

      {linkType === 'Category' && selectedCategory && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Selected Category</p>
           <p className="text-sm font-bold text-gray-900">{selectedCategory.name}</p>
           <p className="text-xs text-blue-600 truncate">{value}</p>
        </div>
      )}

      {linkType === 'Collection' && selectedCollection && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Selected Collection</p>
           <p className="text-sm font-bold text-gray-900">{selectedCollection.name}</p>
           <p className="text-xs text-blue-600 truncate">{value}</p>
        </div>
      )}
    </div>
  );
}
