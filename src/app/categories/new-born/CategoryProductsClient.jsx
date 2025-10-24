"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/productService';
import Link from 'next/link';

export default function CategoryProductsClient({ categoryId, initialCategory, initialProducts, initialPagination }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [category, setCategory] = useState(initialCategory || {});
  const [pagination, setPagination] = useState(initialPagination || {});
  useEffect(() => {
    setProducts(initialProducts || []);
    setCategory(initialCategory || {});
    setPagination(initialPagination || {});
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif mb-6 text-center">{category?.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {(!products || products.length === 0) && <div className="text-center text-gray-500 mt-10 font-serif">No products found.</div>}
        <div className="text-center mt-10">
          <Link href="/" className="text-[#cda434] underline font-serif">← Back to Categories</Link>
        </div>
      </div>
    </div>
  );
}
