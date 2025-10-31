// app/api/products/[id]/variants/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import { getUniversalSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ 
        success: false,
        error: 'Product not found' 
      }, { status: 404 });
    }

    // ✅ GET AVAILABLE VARIANTS
    const availableVariants = product.getAvailableVariants ? product.getAvailableVariants() : [];
    
    // ✅ GET AVAILABLE SIZES
    const availableSizes = product.getAvailableSizes ? product.getAvailableSizes() : [];
    
    // ✅ GET VARIANTS BY SIZE (for color selection)
    const variantsBySize = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.colors && variant.colors.length > 0) {
          variantsBySize[variant.size] = variant.colors
            .filter(color => color.stock > 0)
            .map(color => ({
              color: color.color,
              stock: color.stock
            }));
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          totalStock: product.totalStock
        },
        variants: availableVariants,
        sizes: availableSizes,
        variantsBySize: variantsBySize
      }
    });

  } catch (error) {
    console.error('Product variants error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch product variants',
      details: error.message
    }, { status: 500 });
  }
}