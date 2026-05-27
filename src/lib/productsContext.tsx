'use client';
import React, { createContext, useContext, useState } from 'react';
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
  // Use the mock data directly without persisting to localStorage to ensure only Excel products are displayed
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleFeatured = (id: string) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, featured: !p.featured } : p)));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: Math.random().toString(36).substring(2, 9) };
    setProducts(prev => [newProduct, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p)));
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
