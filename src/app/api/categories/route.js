// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import Category from '@/Models/Category';
import connectDB from '@/lib/mongodb';
import { cloudinaryService } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories, count: categories.length });
  } catch (err) {
    console.error('GET /api/categories error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories', details: err.message }, { status: 500 });
  }
}

async function generateCategoryFolder(category) {
  const slug = category.slug || category._id.toString();
  const baseDir = path.join(process.cwd(), 'src', 'app', 'categories', slug);
  await fs.promises.mkdir(baseDir, { recursive: true });

  // Server page (uses services, and uses relative client import)
  const pageContent = `
import { notFound } from 'next/navigation';
import CategoryProductsClient from './CategoryProductsClient';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';

export default async function CategoryPage() {
  const idOrSlug = '${category.slug || category._id}';
  try {
    const categoryRes = await categoryService.getById(idOrSlug);
    if (!categoryRes?.success || !categoryRes?.data) notFound();
    const category = categoryRes.data;

    const productRes = await productService.getByCategory(category._id || category.slug, { page:1, limit:12, sort:'createdAt', order:'desc' });
    const initialProducts = productRes?.data?.products || [];
    const initialPagination = productRes?.data?.pagination || {};

    return (
      <CategoryProductsClient
        categoryId={category._id || category.slug}
        initialCategory={category}
        initialProducts={initialProducts}
        initialPagination={initialPagination}
      />
    );
  } catch (err) {
    console.error('Category page load error:', err);
    notFound();
  }
}
`.trim();

  // Client component file placed in same folder (so relative import works)
  const clientContent = `"use client";
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
`;

  await fs.promises.writeFile(path.join(baseDir, 'page.jsx'), pageContent, 'utf8');
  await fs.promises.writeFile(path.join(baseDir, 'CategoryProductsClient.jsx'), clientContent, 'utf8');
  console.log(`✅ Generated folder for category: ${slug}`);
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body?.name) {
      return NextResponse.json({ success: false, error: 'Category name required' }, { status: 400 });
    }

    if (await Category.findOne({ name: body.name })) {
      return NextResponse.json({ success: false, error: 'Category already exists' }, { status: 400 });
    }

    // handle base64 image upload
    if (body.image && typeof body.image === 'string' && body.image.startsWith('data:image')) {
      const upload = await cloudinaryService.uploadImage(body.image);
      body.image = upload.secure_url;
      body.imagePublicId = upload.public_id;
    }

    const category = await Category.create(body);
    await generateCategoryFolder(category);
    return NextResponse.json({ success: true, data: category, message: 'Created and generated page' }, { status: 201 });
  } catch (err) {
    console.error('POST /api/categories error', err);
    return NextResponse.json({ success: false, error: 'Failed to create', details: err.message }, { status: 500 });
  }
}
