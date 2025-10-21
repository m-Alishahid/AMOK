import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import Category from '@/Models/category';
import { cloudinaryService } from '@/lib/cloudinary';

// GET product by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('GET Product Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
  let oldImages = [];
  
  try {
    await connectDB();

    const { id } = params;
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Store old images for cleanup
    oldImages = [...product.images];

    const formData = await request.formData();

    // Extract form data
    const name = formData.get('name');
    const description = formData.get('description');
    const costPrice = parseFloat(formData.get('costPrice'));
    const salePrice = parseFloat(formData.get('salePrice'));
    const discountedPrice = formData.get('discountedPrice') ? parseFloat(formData.get('discountedPrice')) : null;
    const category = formData.get('category');
    const variants = JSON.parse(formData.get('variants') || '[]');
    const status = formData.get('status') || 'Active';
    
    // Handle new images
    const newImageFiles = [];
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('images[') && value instanceof File) {
        newImageFiles.push(value);
      }
    }

    let uploadedImages = [];
    if (newImageFiles.length > 0) {
      // Upload new images to Cloudinary
      uploadedImages = await cloudinaryService.uploadImages(newImageFiles);
    }

    // Calculate total stock from variants
    const totalStock = variants.reduce((sum, variant) => {
      const variantStock = variant.colors.reduce((colorSum, color) => {
        return colorSum + (parseInt(color.stock) || 0);
      }, 0);
      return sum + variantStock;
    }, 0);

    // Set thumbnail
    const thumbnailIndex = parseInt(formData.get('thumbnailIndex')) || 0;
    const thumbnail = uploadedImages[thumbnailIndex] || product.thumbnail;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        costPrice,
        salePrice,
        discountedPrice,
        category,
        variants,
        images: uploadedImages.length > 0 ? uploadedImages : product.images,
        thumbnail,
        totalStock,
        status
      },
      { new: true, runValidators: true }
    ).populate('category');

    // Delete old images if new images were uploaded
    if (uploadedImages.length > 0 && oldImages.length > 0) {
      await cloudinaryService.deleteImages(oldImages).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('PUT Product Error:', error);
    
    // Delete newly uploaded images if update fails
    if (uploadedImages && uploadedImages.length > 0) {
      await cloudinaryService.deleteImages(uploadedImages).catch(console.error);
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await cloudinaryService.deleteImages(product.images);
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('DELETE Product Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}