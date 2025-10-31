// app/api/products/variants/batch/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import { getUniversalSession } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({
        success: false,
        error: 'Product IDs array is required'
      }, { status: 400 });
    }

    // Fetch all products with their variants
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: 'Active'
    });

    const productsWithVariants = {};

    for (const product of products) {
      const availableVariants = product.getAvailableVariants ? product.getAvailableVariants() : [];
      const availableSizes = product.getAvailableSizes ? product.getAvailableSizes() : [];
      
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

      productsWithVariants[product._id] = {
        product: {
          _id: product._id,
          name: product.name,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          totalStock: product.totalStock,
          requiresSize: product.requiresSize,
          requiresColor: product.requiresColor,
          hasVariants: product.hasVariants
        },
        variants: availableVariants,
        sizes: availableSizes,
        variantsBySize: variantsBySize
      };
    }

    return NextResponse.json({
      success: true,
      data: productsWithVariants
    });

  } catch (error) {
    console.error('Batch variants error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch batch variants',
      details: error.message
    }, { status: 500 });
  }
}