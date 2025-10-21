import { NextResponse } from 'next/server';
import Category from '../../../../Models/Category';
import connectDB from '@/lib/mongodb';

// GET category by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('GET Category Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch category',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // If updating name, check for duplicates
    if (body.name) {
      const existingCategory = await Category.findOne({ 
        name: body.name, 
        _id: { $ne: id } 
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Category with this name already exists' 
          },
          { status: 400 }
        );
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      id, 
      body, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('PUT Category Error:', error);
    
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
        error: 'Failed to update category',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('DELETE Category Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete category',
        details: error.message 
      },
      { status: 500 }
    );
  }
}