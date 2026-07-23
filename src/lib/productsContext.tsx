'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from './mockData';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  toggleFeatured: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const dbProducts: Product[] = await res.json();
        if (Array.isArray(dbProducts)) {
          setProducts(dbProducts);
        }
      } else {
        console.error('Failed to load products from DB, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to load products from DB', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatic global fetch of all products on mount has been removed to optimize Neon bandwidth.
  // Pages or dashboards requiring all products should invoke refreshProducts() explicitly.

  const toggleFeatured = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newFeatured = !product.featured;
    // Optimistic UI update
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, featured: newFeatured } : p)));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (!res.ok) {
        // Revert on failure
        setProducts(prev => prev.map(p => (p.id === id ? { ...p, featured: product.featured } : p)));
        console.error('Failed to toggle featured in DB');
      }
    } catch (err) {
      // Revert on failure
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, featured: product.featured } : p)));
      console.error('Failed to toggle featured in DB', err);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const savedProduct: Product = await res.json();
        setProducts(prev => [savedProduct, ...prev]);
        return { success: true, message: 'Product created successfully.' };
      } else {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        const msg = errBody?.error || `Server error ${res.status}`;
        console.error('addProduct API error:', msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      console.error('Failed to add product to DB', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        return { success: true, message: 'Product deleted successfully.' };
      } else {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        const msg = errBody?.error || `Server error ${res.status}`;
        console.error('deleteProduct API error:', msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      console.error('Failed to delete product from DB', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<{ success: boolean; message: string }> => {
    const original = products.find(p => p.id === id);
    // Optimistic update
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p)));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        return { success: true, message: 'Product updated successfully.' };
      } else {
        // Revert optimistic update
        if (original) setProducts(prev => prev.map(p => (p.id === id ? original : p)));
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        const msg = errBody?.error || `Server error ${res.status}`;
        console.error('updateProduct API error:', msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      // Revert on failure
      if (original) setProducts(prev => prev.map(p => (p.id === id ? original : p)));
      console.error('Failed to update product in DB', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const contextValue = useMemo(() => ({
    products,
    isLoading,
    toggleFeatured,
    addProduct,
    deleteProduct,
    updateProduct,
    refreshProducts
  }), [products, isLoading, toggleFeatured, addProduct, deleteProduct, updateProduct, refreshProducts]);

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within a ProductsProvider');
  return context;
}
