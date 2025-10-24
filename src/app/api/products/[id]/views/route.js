import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { views: product.views }
    });
  } catch (error) {
    console.error('Increment Views Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to increment views',
        details: error.message 
      },
      { status: 500 }
    );
  }
}