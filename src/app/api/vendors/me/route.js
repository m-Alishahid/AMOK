// app/api/vendors/me/route.js - FIXED
import { NextResponse } from 'next/server';
import Vendor from '@/Models/Vendor';
import User from '@/Models/User';
import connectDB from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth'; // ✅ Use getServerSession instead

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Find user from session
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    if (!user.isVendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    // ✅ FIXED: Remove problematic populate for deleteRequests
    const vendor = await Vendor.findOne({ user: user._id })
      .populate('user', 'firstName lastName email phone')
      .populate('products.product', 'name salePrice costPrice images variants');
      // ❌ REMOVED: .populate('deleteRequests.product', 'name');

    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    // Calculate vendor stats
    const vendorStats = {
      totalProducts: vendor.products.length,
      totalAllocatedValue: vendor.totalAllocatedValue || 0,
      totalSoldValue: vendor.totalSoldValue || 0,
      outstandingBalance: vendor.outstandingBalance || 0,
      currentStock: vendor.products.reduce((sum, p) => sum + (p.currentStock || 0), 0),
      soldStock: vendor.products.reduce((sum, p) => sum + (p.soldStock || 0), 0),
      pendingDeleteRequests: vendor.deleteRequests?.filter(req => req.status === 'Pending').length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        vendor: {
          ...vendor.toObject(),
          stats: vendorStats
        }
      }
    });
  } catch (error) {
    console.error('Vendor me error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// UPDATE vendor profile (for vendors to update their own info)
export async function PUT(request) {
  try {
    await connectDB();
    
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user || !user.isVendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { companyName, contactPerson, phone, address, email } = body;

    const vendor = await Vendor.findOneAndUpdate(
      { user: user._id },
      {
        companyName,
        contactPerson,
        phone,
        address,
        email
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone');

    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Update vendor me error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}