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
    <Suspense fallback={<div>Loading...</div>}>
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
  // Sync with URL query params
  const urlCategory = searchParams.get('category') ?? '';
  const urlSubcategory = searchParams.get('subcategory') ?? '';
  // Update selected state when URL changes
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    else setSelectedCategory('');
    if (urlSubcategory) setSelectedSubcategory(urlSubcategory);
    else setSelectedSubcategory('');
  }, [urlCategory, urlSubcategory]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(-1);
  const [minRating, setMinRating] = useState<number>(0);
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
    // Also filter by URL params directly (in case state not set yet)
    if (urlCategory && !selectedCategory) list = list.filter(p => p.category === urlCategory);
    if (urlSubcategory && !selectedSubcategory) list = list.filter(p => p.subcategory === urlSubcategory);
    if (selectedMaterial) list = list.filter(p => p.material === selectedMaterial);
    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      list = list.filter(p => p.finalPrice >= range.min && p.finalPrice < range.max);
    }
    if (minRating > 0) list = list.filter(p => p.rating >= minRating);
    if (inStockOnly) list = list.filter(p => p.stock > 0);
    if (featuredOnly) list = list.filter(p => p.featured);
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.finalPrice - b.finalPrice); break;
      case 'price-desc': list.sort((a, b) => b.finalPrice - a.finalPrice); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'popular': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return list;
  }, [selectedCategory, selectedPriceRange, minRating, sortBy, inStockOnly, featuredOnly, searchQuery, urlCategory, urlSubcategory]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedMaterial('');
    setSelectedPriceRange(-1);
    setMinRating(0);
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortBy('default');
  };

  const hasFilters = selectedCategory || selectedSubcategory || selectedMaterial || selectedPriceRange >= 0 || minRating > 0 || inStockOnly || featuredOnly;

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-sm px-3 py-2.5 rounded transition-colors ${!selectedCategory ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
          >
            All Categories</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded flex items-center justify-between transition-colors ${selectedCategory === cat.id ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
            >
              <span>{cat.name}</span>
              <span className="text-xs opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Subcategory */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Subcategory</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`w-full text-left text-sm px-3 py-2.5 rounded transition-colors ${!selectedSubcategory ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
          >
            All Subcategories</button>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded flex items-center justify-between transition-colors ${selectedSubcategory === sub.id ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
            >
              <span>{sub.name}</span>
              <span className="text-xs opacity-60"></span>
            </button>
          ))}
        </div>
      </div>
      {/* Material */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Material</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedMaterial('')}
            className={`w-full text-left text-sm px-3 py-2.5 rounded transition-colors ${!selectedMaterial ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
          >
            All Materials</button>
          {materials.map(mat => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded flex items-center justify-between transition-colors ${selectedMaterial === mat ? 'bg-brand-accent/10 text-brand-accent font-medium' : 'text-brand-muted hover:bg-brand-card'}`}
            >
              <span>{mat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Price</h3>
        <div className="space-y-3 px-3">
          {priceRanges.map((range, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={selectedPriceRange === i}
                onChange={() => setSelectedPriceRange(i)}
                className="w-4 h-4 accent-brand-accent bg-transparent border-gray-300"
              />
              <span className={`text-sm group-hover:text-brand-accent transition-colors ${selectedPriceRange === i ? 'text-brand-accent font-medium' : 'text-brand-muted'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Rating</h3>
        <div className="space-y-3 px-3">
          {[4.5, 4, 3.5, 3].map(r => (
            <label key={r} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="w-4 h-4 accent-brand-accent bg-transparent border-gray-300"
              />
              <span className={`text-sm flex items-center gap-1 group-hover:text-brand-accent transition-colors ${minRating === r ? 'text-brand-accent font-medium' : 'text-brand-muted'}`}>
                ★ {r}+
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div>
        <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">Features</h3>
        <div className="space-y-3 px-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-brand-accent bg-transparent border-gray-300 rounded"
            />
            <span className={`text-sm group-hover:text-brand-accent transition-colors ${inStockOnly ? 'text-brand-accent font-medium' : 'text-brand-muted'}`}>
              In Stock Only
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 accent-brand-accent bg-transparent border-gray-300 rounded"
            />
            <span className={`text-sm group-hover:text-brand-accent transition-colors ${featuredOnly ? 'text-brand-accent font-medium' : 'text-brand-muted'}`}>
              Featured Products
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-brand-card py-16 border-b border-gray-100 text-center">
        <h1 className="font-serif text-4xl font-bold text-brand-text mb-4">Shop the Collection</h1>
        <p className="text-brand-muted max-w-2xl mx-auto">Discover our handcrafted masterpieces. Ethically sourced and made with love.</p>
      </div>

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1920px]">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <p className="text-sm text-brand-muted">{filtered.length} products</p>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-none text-sm text-brand-text pl-3 pr-8 py-2 outline-none cursor-pointer hover:text-brand-accent"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-text pointer-events-none" />
            </div>
            
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-brand-card hover:bg-gray-100 text-brand-text text-sm font-medium px-4 py-2.5 rounded transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters {hasFilters && `(Active)`}
            </button>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Filter Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="w-[85%] max-w-sm bg-brand-bg h-full overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-brand-bg z-10">
                  <h2 className="font-serif text-xl font-bold text-brand-text">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-brand-muted hover:text-brand-text"><X size={24} /></button>
                </div>
                <div className="p-6">
                  {hasFilters && (
                    <button onClick={clearFilters} className="mb-6 w-full py-2 border border-brand-accent text-brand-accent text-sm font-medium rounded hover:bg-brand-accent hover:text-white transition-colors">
                      Clear All Filters
                    </button>
                  )}
                  <FilterPanel />
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full mt-8 bg-brand-accent text-white font-medium py-3.5 rounded shadow-lg hover:bg-opacity-90 transition-colors"
                  >
                    View Results ({filtered.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 bg-brand-card rounded-full flex items-center justify-center mb-4">
                  <X className="text-brand-muted" size={24} />
                </div>
                <p className="font-serif text-2xl font-bold text-brand-text mb-2">No matching products</p>
                <p className="text-brand-muted max-w-md">Try adjusting your filters or browsing a different category.</p>
                <button onClick={clearFilters} className="mt-6 border border-brand-text text-brand-text px-6 py-2.5 rounded font-medium hover:bg-brand-text hover:text-white transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
