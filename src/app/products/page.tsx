'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { categories, subcategories, materials } from '@/lib/mockData';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
  { label: 'Above ₹5000', min: 5000, max: Infinity },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-[family-name:var(--font-heading)] text-2xl text-[--color-brand-text]">Loading collection...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const urlCategory = searchParams.get('category') ?? '';
  const urlSubcategory = searchParams.get('subcategory') ?? '';

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    else setSelectedCategory('');
    if (urlSubcategory) setSelectedSubcategory(urlSubcategory);
    else setSelectedSubcategory('');
  }, [urlCategory, urlSubcategory]);

  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(-1);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery) {
      list = list.filter(p => p.name.toLowerCase().includes(searchQuery) || p.description?.toLowerCase().includes(searchQuery));
    }
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (selectedSubcategory) list = list.filter(p => p.subcategory === selectedSubcategory);
    if (urlCategory && !selectedCategory) list = list.filter(p => p.category === urlCategory);
    if (urlSubcategory && !selectedSubcategory) list = list.filter(p => p.subcategory === urlSubcategory);
    if (selectedMaterial) list = list.filter(p => p.material === selectedMaterial);
    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      list = list.filter(p => p.finalPrice >= range.min && p.finalPrice < range.max);
    }
    if (inStockOnly) list = list.filter(p => p.stock > 0);
    if (featuredOnly) list = list.filter(p => p.featured);
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.finalPrice - b.finalPrice); break;
      case 'price-desc': list.sort((a, b) => b.finalPrice - a.finalPrice); break;
      case 'popular': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return list;
  }, [selectedCategory, selectedPriceRange, sortBy, inStockOnly, featuredOnly, searchQuery, urlCategory, urlSubcategory, selectedMaterial, products, selectedSubcategory]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedMaterial('');
    setSelectedPriceRange(-1);
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortBy('default');
  };

  const hasFilters = selectedCategory || selectedSubcategory || selectedMaterial || selectedPriceRange >= 0 || inStockOnly || featuredOnly;

  const FilterPanel = () => (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Category</h3>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedCategory ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${selectedCategory === cat.id ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {selectedCategory && (
        <div>
          <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Subcategory</h3>
          <div className="space-y-2 mt-4">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedSubcategory ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              All Subcategories
            </button>
            {subcategories.filter(sub => sub.category === selectedCategory).map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${selectedSubcategory === sub.id ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material */}
      <div>
        <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Material</h3>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => setSelectedMaterial('')}
            className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedMaterial ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
          >
            All Materials
          </button>
          {materials.map(mat => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${selectedMaterial === mat ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Price</h3>
        <div className="space-y-3 mt-4 px-2">
          {priceRanges.map((range, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={selectedPriceRange === i}
                onChange={() => setSelectedPriceRange(i)}
                className="w-4 h-4 accent-[--color-brand-accent] bg-transparent border-gray-300"
              />
              <span className={`text-sm transition-colors ${selectedPriceRange === i ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] group-hover:text-[--color-brand-text]'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div>
        <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Availability</h3>
        <div className="space-y-3 mt-4 px-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-[--color-brand-accent] bg-transparent border-gray-300 rounded"
            />
            <span className={`text-sm transition-colors ${inStockOnly ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] group-hover:text-[--color-brand-text]'}`}>
              In Stock Only
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 accent-[--color-brand-accent] bg-transparent border-gray-300 rounded"
            />
            <span className={`text-sm transition-colors ${featuredOnly ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] group-hover:text-[--color-brand-text]'}`}>
              Featured
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg] font-sans">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[--color-brand-card] py-20 border-b border-[--color-brand-border] text-center">
        <span className="text-[--color-brand-accent] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">The Collection</span>
        <h1 className="font-[family-name:var(--font-heading)] text-5xl font-bold text-[--color-brand-text] mb-4">Artisan Crafted</h1>
        <p className="text-[--color-brand-muted] max-w-2xl mx-auto text-lg">Authentic materials shaped by generations of master artisans.</p>
      </div>

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-[1600px]">
        {/* Controls */}
        <div className="flex items-center justify-between mb-12 pb-4 border-b border-[--color-brand-border]">
          <p className="text-sm font-medium text-[--color-brand-muted] tracking-wide">{filtered.length} curated products</p>
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-none text-sm text-[--color-brand-text] pl-3 pr-8 py-2 outline-none cursor-pointer hover:text-[--color-brand-accent] font-medium tracking-wide uppercase"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[--color-brand-text] pointer-events-none" />
            </div>
            
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 text-[--color-brand-text] text-sm font-medium px-4 py-2 border border-[--color-brand-text] transition-colors hover:bg-[--color-brand-text] hover:text-white uppercase tracking-widest"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            {hasFilters && (
              <button onClick={clearFilters} className="mb-8 w-full py-2.5 border border-[--color-brand-accent] text-[--color-brand-accent] text-xs uppercase tracking-widest font-bold hover:bg-[--color-brand-accent] hover:text-[--color-brand-bg] transition-colors rounded-sm">
                Clear Filters
              </button>
            )}
            <FilterPanel />
          </aside>

          {/* Mobile Filter Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="w-[85%] max-w-sm bg-[--color-brand-bg] h-full overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[--color-brand-border] sticky top-0 bg-[--color-brand-bg] z-10">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[--color-brand-text]">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-[--color-brand-muted] hover:text-[--color-brand-text]"><X size={24} /></button>
                </div>
                <div className="p-6 flex-1">
                  {hasFilters && (
                    <button onClick={clearFilters} className="mb-8 w-full py-3 border border-[--color-brand-accent] text-[--color-brand-accent] text-xs uppercase tracking-widest font-bold hover:bg-[--color-brand-accent] hover:text-[--color-brand-bg] transition-colors">
                      Clear Filters
                    </button>
                  )}
                  <FilterPanel />
                </div>
                <div className="p-6 border-t border-[--color-brand-border] sticky bottom-0 bg-[--color-brand-bg]">
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full bg-[--color-brand-text] text-[--color-brand-bg] font-bold py-4 uppercase tracking-widest text-sm hover:bg-[--color-brand-accent] transition-colors"
                  >
                    View {filtered.length} Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-[--color-brand-border]">
                <div className="w-16 h-16 bg-[--color-brand-card] rounded-full flex items-center justify-center mb-6">
                  <X className="text-[--color-brand-muted]" size={24} />
                </div>
                <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[--color-brand-text] mb-4">Nothing Found</p>
                <p className="text-[--color-brand-muted] max-w-md text-lg">We couldn't find any artisans works matching your criteria.</p>
                <button onClick={clearFilters} className="mt-8 bg-transparent border border-[--color-brand-text] text-[--color-brand-text] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[--color-brand-text] hover:text-[--color-brand-bg] transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
