import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import Category from '@/Models/Category';

// GET products by category ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { categoryId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Pagination and filtering options
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status') || 'Active';

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Build filter object
    const filter = { category: categoryId, status };
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.salePrice.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('category')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        category
      }
    });
  } catch (error) {
    console.error('GET Products by Category Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products by category',
        details: error.message 
      },
      { status: 500 }
    );
  }
}