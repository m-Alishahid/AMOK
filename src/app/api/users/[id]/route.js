import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../Models/User';

// GET user by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const user = await User.findById(id).populate('role').select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GET User Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    const user = await User.findByIdAndUpdate(
      id, 
      body, 
      { new: true, runValidators: true }
    ).populate('role').select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('PUT User Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('DELETE User Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}