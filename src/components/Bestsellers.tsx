'use client';
import React from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/productsContext';

export default function Bestsellers() {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {featuredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
