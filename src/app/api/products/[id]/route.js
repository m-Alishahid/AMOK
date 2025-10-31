// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import { cloudinaryService } from '@/lib/cloudinary';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).populate('category');
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error('GET Product Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch product', details: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  // ensure uploadedImages variable is visible in catch
  let uploadedImages = [];
  let uploadedThumbnail = null;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    // formData usage (for files + fields)
    const formData = await request.formData();

    // basic fields
    const name = formData.get('name') ?? product.name;
    const description = formData.get('description') ?? product.description;
    const costPrice = formData.get('costPrice') ? parseFloat(formData.get('costPrice')) : product.costPrice;
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice')) : product.salePrice;
    const discountedPrice = formData.get('discountedPrice') ? parseFloat(formData.get('discountedPrice')) : product.discountedPrice;
    const category = formData.get('category') ?? product.category?.toString();
    const variants = formData.get('variants') ? JSON.parse(formData.get('variants')) : product.variants;
    const status = formData.get('status') ?? product.status;

    // Collect image files from formData
    // Note: depending on frontend you might send multiple 'images' fields
    const imageFiles = formData.getAll('images'); // array, possibly empty
    const thumbnailFile = formData.get('thumbnail'); // may be null

    // Upload thumbnail if provided
    if (thumbnailFile && typeof thumbnailFile !== 'string') {
      // delete old thumbnail from cloudinary if exists (we store URLs)
      if (product.thumbnail) {
        try {
          await cloudinaryService.deleteImage(product.thumbnail);
        } catch (err) {
          console.warn('Failed deleting old thumbnail:', err?.message ?? err);
        }
      }

      // upload new thumbnail
      const thumbRes = await cloudinaryService.uploadImage(thumbnailFile, 'products');
      // thumbRes is full result; but service returns result—use secure_url if present, fallback result
      uploadedThumbnail = thumbRes.secure_url || (typeof thumbRes === 'string' ? thumbRes : null);
    }

    // Upload gallery images if new provided
    if (imageFiles && imageFiles.length > 0) {
      // delete old images from cloudinary (best effort)
      if (product.images && product.images.length > 0) {
        try {
          await cloudinaryService.deleteImages(product.images);
        } catch (err) {
          console.warn('Failed deleting old images:', err?.message ?? err);
        }
      }

      // Upload new ones (uploadImages accepts File-like objects)
      uploadedImages = await cloudinaryService.uploadImages(imageFiles, 'products'); // returns array of URLs
    }

    // Calculate totalStock from variants if needed (mirror your schema logic)
    let totalStock = product.totalStock ?? 0;
    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((sum, variant) => {
        const variantStock = (variant.colors || []).reduce((cSum, c) => cSum + (parseInt(c.stock) || 0), 0);
        return sum + variantStock;
      }, 0);
    }

    // Determine final thumbnail and images to save
    const finalThumbnail = uploadedThumbnail || product.thumbnail || '';
    const finalImages = (uploadedImages && uploadedImages.length > 0) ? uploadedImages : (product.images || []);

    // Update product
    product.name = name;
    product.description = description;
    product.costPrice = costPrice;
    product.salePrice = salePrice;
    product.discountedPrice = discountedPrice;
    product.category = category;
    product.variants = variants;
    product.status = status;
    product.images = finalImages;
    product.thumbnail = finalThumbnail;
    product.totalStock = totalStock;
    product.updatedAt = new Date();

    await product.save();

    return NextResponse.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (err) {
    console.error('PUT Product Error:', err);

    // Cleanup any newly uploaded images on failure
    try {
      if (uploadedThumbnail) {
        await cloudinaryService.deleteImage(uploadedThumbnail).catch(e => console.warn('cleanup thumbnail failed', e));
      }
      if (uploadedImages && uploadedImages.length > 0) {
        await cloudinaryService.deleteImages(uploadedImages).catch(e => console.warn('cleanup images failed', e));
      }
    } catch (cleanupErr) {
      console.warn('Cleanup error:', cleanupErr);
    }

    // If validation error from mongoose, format response
    if (err?.name === 'ValidationError') {
      const errors = Object.values(err.errors || {}).map(e => e.message);
      return NextResponse.json({ success: false, error: 'Validation failed', details: errors }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to update product', details: err.message }, { status: 500 });
  }
  
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    // Delete thumbnail if present
    if (product.thumbnail) {
      try {
        await cloudinaryService.deleteImage(product.thumbnail);
      } catch (err) {
        console.warn('Failed to delete thumbnail:', err?.message ?? err);
      }
    }

    // Delete gallery images if present
    if (product.images && product.images.length > 0) {
      try {
        await cloudinaryService.deleteImages(product.images);
      } catch (err) {
        console.warn('Failed to delete product images:', err?.message ?? err);
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('DELETE Product Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete product', details: err.message }, { status: 500 });
  }
}
