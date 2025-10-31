// app/api/vendors/[id]/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin } from '@/lib/auth';
import Vendor from '@/Models/Vendor';
import User from '@/Models/User';
import connectDB from '@/lib/mongodb';
// import Product from '@/Models/Product';

// GET vendor by ID
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
    
    // Users can only access their own vendor profile unless they're admin
    if (!isAdmin(session)) {
      const user = await User.findById(session.user.id);
      const vendor = await Vendor.findOne({ user: user._id });
      
      if (!vendor || vendor._id.toString() !== id) {
        return NextResponse.json({ 
          success: false,
          error: 'Forbidden - Access denied' 
        }, { status: 403 });
      }
    }

    const vendor = await Vendor.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('products.product', 'name salePrice costPrice images variants')
      .populate('deleteRequests.product', 'name');

    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// UPDATE vendor
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Only admin can update vendor profiles
    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const vendor = await Vendor.findByIdAndUpdate(
      id, 
      body, 
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone');

    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vendor updated successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE vendor
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Only admin can delete vendors
    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    const { id } = params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    // Update user's vendor status
    await User.findByIdAndUpdate(vendor.user, {
      isVendor: false,
      vendorProfile: null
    });

    await Vendor.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}