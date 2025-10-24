import { NextResponse } from 'next/server';
import Category from '@/Models/Category';
import connectDB from '@/lib/mongodb';
import { cloudinaryService } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

async function findBySlugOrId(slug) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  if (isObjectId) return Category.findById(slug);
  return Category.findOne({ slug });
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params; // ✅ await added
    const category = await findBySlugOrId(slug);
    console.log('Fetched category:', category);
    
    if (!category)
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    console.error('GET /api/categories/[slug] error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch', details: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params; // ✅ await added
    const body = await request.json();
    const category = await findBySlugOrId(slug);
    if (!category)
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

    if (body.name && body.name !== category.name) {
      const dup = await Category.findOne({ name: body.name, _id: { $ne: category._id } });
      if (dup)
        return NextResponse.json({ success: false, error: 'Name already used' }, { status: 400 });
    }

    if (body.image && body.image.startsWith('data:image')) {
      if (category.imagePublicId) {
        try { await cloudinaryService.deleteImage(category.imagePublicId); } catch (e) { console.warn(e); }
      }
      const upload = await cloudinaryService.uploadImage(body.image);
      body.image = upload.secure_url;
      body.imagePublicId = upload.public_id;
    }

    const updated = await Category.findByIdAndUpdate(category._id, body, { new: true, runValidators: true });

    const oldName = category.slug || category._id.toString();
    const newName = updated.slug || updated._id.toString();
    if (oldName !== newName) {
      const oldDir = path.join(process.cwd(), 'src', 'app', 'categories', oldName);
      if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });
    }

    // regenerate folder (short version)
    const baseDir = path.join(process.cwd(), 'src', 'app', 'categories', newName);
    await fs.promises.mkdir(baseDir, { recursive: true });
    await fs.promises.writeFile(
      path.join(baseDir, 'page.jsx'),
      `import { notFound } from 'next/navigation';
import CategoryProductsClient from './CategoryProductsClient';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
export default async function CategoryPage() {
  const idOrSlug = '${updated.slug || updated._id}';
  try {
    const categoryRes = await categoryService.getById(idOrSlug);
    if (!categoryRes?.success || !categoryRes?.data) notFound();
    const category = categoryRes.data;
    const productRes = await productService.getByCategory(category._id, { page:1, limit:12, sort:'createdAt', order:'desc' });
    const initialProducts = productRes?.data?.products || [];
    const initialPagination = productRes?.data?.pagination || {};
    return <CategoryProductsClient categoryId={category._id} initialCategory={category} initialProducts={initialProducts} initialPagination={initialPagination} />;
  } catch(err){ console.error(err); notFound(); }
}`
    );

    return NextResponse.json({ success: true, data: updated, message: 'Updated' });
  } catch (err) {
    console.error('PUT /api/categories/[slug] error', err);
    return NextResponse.json({ success: false, error: 'Failed to update', details: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params; // ✅ await added
    const category = await findBySlugOrId(slug);
    if (!category)
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

    if (category.imagePublicId) {
      try { await cloudinaryService.deleteImage(category.imagePublicId); } catch (e) { console.warn(e); }
    }

    await Category.findByIdAndDelete(category._id);

    const folderName = category.slug || category._id.toString();
    const dir = path.join(process.cwd(), 'src', 'app', 'categories', folderName);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/categories/[slug] error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete', details: err.message }, { status: 500 });
  }
}
