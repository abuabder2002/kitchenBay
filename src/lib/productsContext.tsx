'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, products as initialProducts } from './mockData';

interface ProductsContextType {
  products: Product[];
  toggleFeatured: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with mock data, then merge with database data
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((dbProducts: Product[]) => {
        if (Array.isArray(dbProducts)) {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = dbProducts.filter(p => !existingIds.has(p.id));
            return [...newProducts, ...prev];
          });
        }
      })
      .catch(err => console.error('Failed to load products from DB', err));
  }, []);

  const toggleFeatured = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setProducts(prev => prev.map(p => (p.id === id ? { ...p, featured: !p.featured } : p)));
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured })
      });
    } catch (err) {
      console.error("Failed to toggle featured in DB", err);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const savedProduct = await res.json();
        setProducts(prev => [savedProduct, ...prev]);
      } else {
        console.error("API returned error", await res.text());
        const newProduct: Product = { ...product, id: Math.random().toString(36).substring(2, 9) };
        setProducts(prev => [newProduct, ...prev]);
      }
    } catch (err) {
      console.error("Failed to add product to DB", err);
      const newProduct: Product = { ...product, id: Math.random().toString(36).substring(2, 9) };
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete product from DB", err);
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p)));
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error("Failed to update product in DB", err);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, toggleFeatured, addProduct, deleteProduct, updateProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within a ProductsProvider');
  return context;
}
