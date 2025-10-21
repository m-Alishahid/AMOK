import { NextResponse } from 'next/server';
import Category from '../../../Models/Category';
import connectDB from '../../../lib/mongodb';

// GET all categories
export async function GET() {
  try {
    await connectDB();
    
    const categories = await Category.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('GET Categories Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name: body.name });
    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Category with this name already exists' 
        },
        { status: 400 }
      );
    }
    
    const category = await Category.create(body);
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('POST Category Error:', error);
    
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
        error: 'Failed to create category',
        details: error.message 
      },
      { status: 500 }
    );
  }
}