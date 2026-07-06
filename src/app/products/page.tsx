'use client';
/* eslint-disable react-hooks/set-state-in-effect */


import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/productsContext';
import { categories, subcategories, materials } from '@/lib/mockData';
import type { Product } from '@/lib/mockData';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search')?.trim() || '';

  const urlCategory = searchParams.get('category') ?? '';
  const urlSubcategory = searchParams.get('subcategory') ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(urlSubcategory);
  const [expandedCategory, setExpandedCategory] = useState<string>(urlCategory);

  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(-1);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [pageProducts, setPageProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [dynamicSubcategories, setDynamicSubcategories] = useState<any[]>(subcategories);

  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSelectedSubcategory(urlSubcategory);
    setExpandedCategory(urlCategory);
  }, [urlCategory, urlSubcategory]);

  // Load dynamic subcategories (just like Navbar does)
  useEffect(() => {
    fetch('/api/admin/subcategories?limit=100&isActive=true')
      .then(res => res.json())
      .then(data => {
        if (data.subcategories && data.subcategories.length > 0) {
          const mapped = data.subcategories.map((s: any) => {
            const catName = (s.category?.name || '').toLowerCase();
            let catId = catName.replace(/[^a-z0-9]+/g, '-');
            if (catName.includes('kitchen')) catId = 'kitchenware';
            else if (catName.includes('dining')) catId = 'dining';
            else if (catName.includes('brass') || catName.includes('copper')) catId = 'brass-copper';
            else if (catName.includes('decor')) catId = 'decor';
            
            return {
              id: s.slug,
              name: s.name,
              category: catId
            };
          });
          setDynamicSubcategories(mapped);
        }
      })
      .catch(console.error);
  }, []);

  // Load unique brands list once to populate filter sidebar
  useEffect(() => {
    fetch('/api/products?limit=500')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map((p: any) => p.brand).filter(Boolean);
          setBrands(Array.from(new Set(list)) as string[]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch paginated products based on query state with race condition protection
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '12'); // 12 items per page
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (selectedMaterial) params.set('material', selectedMaterial);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (featuredOnly) params.set('featured', 'true');
    if (inStockOnly) params.set('inStock', 'true');
    if (sortBy !== 'default') params.set('sortBy', sortBy);

    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      params.set('minPrice', range.min.toString());
      if (range.max !== Infinity) {
        params.set('maxPrice', range.max.toString());
      }
    }

    fetch(`/api/products?${params.toString()}`)
      .then(async (res) => {
        if (!active) return;
        if (res.ok) {
          const totalHeader = res.headers.get('X-Total-Count');
          if (totalHeader && active) {
            setTotalProducts(parseInt(totalHeader) || 0);
          }
          const data = await res.json();
          if (active && Array.isArray(data)) {
            setPageProducts(data);
          }
        }
      })
      .catch(err => {
        if (active) {
          console.error("Error loading products:", err);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    page,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedMaterial,
    selectedBrand,
    selectedPriceRange,
    inStockOnly,
    featuredOnly,
    sortBy
  ]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedMaterial,
    selectedBrand,
    selectedPriceRange,
    inStockOnly,
    featuredOnly,
    sortBy
  ]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedMaterial('');
    setSelectedBrand('');
    setSelectedPriceRange(-1);
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortBy('default');
    router.push('/products');
  };

  const hasFilters = selectedCategory || selectedSubcategory || selectedMaterial || selectedBrand || selectedPriceRange >= 0 || inStockOnly || featuredOnly;

  const FilterPanel = () => (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Category</h3>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => {
              setExpandedCategory('');
              setSelectedCategory('');
              setSelectedSubcategory('');
              const params = new URLSearchParams(window.location.search);
              params.delete('category');
              params.delete('subcategory');
              params.delete('page');
              const queryStr = params.toString();
              router.push(queryStr ? `/products?${queryStr}` : '/products');
            }}
            className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedCategory ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setExpandedCategory(expandedCategory === cat.id ? '' : cat.id);
              }}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${expandedCategory === cat.id ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {expandedCategory && (
        <div>
          <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Subcategory</h3>
          <div className="space-y-2 mt-4">
            <button
              onClick={() => {
                setSelectedSubcategory('');
                const params = new URLSearchParams(window.location.search);
                params.delete('subcategory');
                params.set('category', expandedCategory);
                params.delete('page');
                const queryStr = params.toString();
                router.push(queryStr ? `/products?${queryStr}` : '/products');
              }}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedSubcategory && selectedCategory === expandedCategory ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              All Subcategories
            </button>
            {dynamicSubcategories.filter(sub => sub.category === expandedCategory).map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubcategory(sub.id);
                  const params = new URLSearchParams(window.location.search);
                  params.set('subcategory', sub.id);
                  params.set('category', expandedCategory);
                  params.delete('page');
                  router.push(`/products?${params.toString()}`);
                }}
                className={`w-full text-left px-4 py-2 text-sm rounded-sm transition-colors ${
                  selectedSubcategory === sub.id
                    ? 'bg-[--color-brand-text] text-white font-medium'
                    : 'text-[--color-brand-muted] hover:bg-gray-100'
                }`}
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

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[--color-brand-text] mb-4 uppercase tracking-widest font-[family-name:var(--font-heading)] border-b border-[--color-brand-border] pb-2">Brand</h3>
          <div className="space-y-2 mt-4">
            <button
              onClick={() => setSelectedBrand('')}
              className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${!selectedBrand ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
            >
              All Brands
            </button>
            {brands.map(br => (
              <button
                key={br}
                onClick={() => setSelectedBrand(br)}
                className={`w-full text-left text-sm px-2 py-1.5 transition-colors ${selectedBrand === br ? 'text-[--color-brand-accent] font-bold' : 'text-[--color-brand-muted] hover:text-[--color-brand-text]'}`}
              >
                {br}
              </button>
            ))}
          </div>
        </div>
      )}

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

      <Breadcrumbs items={[
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
      ]} />



      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-[1600px]">
        {/* Controls */}
        <div className="flex items-center justify-end mb-12 pb-4 border-b border-[--color-brand-border]">
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
            {FilterPanel()}
          </aside>

          {/* Mobile Filter Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-[100] flex md:hidden">
              <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="w-[85%] max-w-sm bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[--color-brand-border] sticky top-0 bg-white z-10">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[--color-brand-text]">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-[--color-brand-muted] hover:text-[--color-brand-text]"><X size={24} /></button>
                </div>
                <div className="p-6 flex-1 bg-white">
                  {hasFilters && (
                    <button onClick={clearFilters} className="mb-8 w-full py-3 border border-[--color-brand-accent] text-[--color-brand-accent] text-xs uppercase tracking-widest font-bold hover:bg-[--color-brand-accent] hover:text-[--color-brand-bg] transition-colors">
                      Clear Filters
                    </button>
                  )}
                  {FilterPanel()}
                </div>
                <div className="p-6 border-t border-[--color-brand-border] sticky bottom-0 bg-white">
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full bg-[--color-brand-text] text-white font-bold py-4 uppercase tracking-widest text-sm hover:bg-[--color-brand-accent] transition-colors"
                  >
                    View {totalProducts} Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search header */}
            {searchQuery && !isLoading && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[--color-brand-muted]">
                  Search results for <span className="font-bold text-[--color-brand-text]">&quot;{searchQuery}&quot;</span> — {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-12 h-12 border-4 border-[--color-brand-accent] border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-[--color-brand-muted] font-medium">Loading products…</p>
              </div>
            ) : pageProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-[--color-brand-border]">
                <div className="w-16 h-16 bg-[--color-brand-card] rounded-full flex items-center justify-center mb-6">
                  <X className="text-[--color-brand-muted]" size={24} />
                </div>
                <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[--color-brand-text] mb-4">Nothing Found</p>
                <p className="text-[--color-brand-muted] max-w-md text-lg">
                  {searchQuery
                    ? `No products matched "${searchQuery}". Try a different keyword.`
                    : `We couldn't find any products matching your criteria.`
                  }
                </p>
                <button onClick={clearFilters} className="mt-8 bg-transparent border border-[--color-brand-text] text-[--color-brand-text] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[--color-brand-text] hover:text-[--color-brand-bg] transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
                  {pageProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalProducts > 12 && (
                  <div className="mt-16 flex items-center justify-center gap-2 border-t border-[--color-brand-border] pt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      className="px-4 py-2 border border-black text-sm font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black cursor-pointer disabled:cursor-not-allowed bg-white text-black"
                    >
                      Prev
                    </button>
                    
                    {(() => {
                      const totalPages = Math.ceil(totalProducts / 12);
                      const getPageNumbers = () => {
                        if (totalPages <= 7) {
                          return Array.from({ length: totalPages }, (_, i) => i + 1);
                        }
                        const pages: (number | string)[] = [];
                        if (page <= 3) {
                          pages.push(1, 2, 3, 4, '...', totalPages);
                        } else if (page >= totalPages - 2) {
                          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
                        }
                        return pages;
                      };

                      return getPageNumbers().map((pNum, idx) => {
                        if (pNum === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-[--color-brand-muted]">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={pNum}
                            onClick={() => setPage(pNum as number)}
                            className={`w-10 h-10 border text-sm font-semibold transition-colors rounded-full flex items-center justify-center cursor-pointer ${
                              page === pNum
                                ? 'bg-brand-accent border-brand-accent text-white font-bold'
                                : 'bg-white border-black text-black hover:bg-gray-100'
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      });
                    })()}
                    
                    <button
                      disabled={page >= Math.ceil(totalProducts / 12)}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 border border-black text-sm font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black cursor-pointer disabled:cursor-not-allowed bg-white text-black"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
