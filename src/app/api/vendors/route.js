// app/api/vendors/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin } from '@/lib/auth';
import Vendor from '@/Models/Vendor';
import User from '@/Models/User';
import connectDB from '@/lib/mongodb';

// GET all vendors (Admin only)
export async function GET(request) {
  try {
    await connectDB();
    
    // Check authentication using universal session (cookies + localStorage)
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please login again' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find()
      .populate('user', 'firstName lastName email phone')
      .populate('products.product', 'name salePrice images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    // Check authentication and authorization
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { userId, companyName, contactPerson, phone, address, commissionRate } = body;

    // Validate required fields
    if (!userId || !companyName || !contactPerson || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, companyName, contactPerson, phone'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ user: userId });
    if (existingVendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor already exists for this user' 
      }, { status: 400 });
    }

    // Create vendor
    const vendor = new Vendor({
      user: userId,
      companyName,
      contactPerson,
      phone,
      address: address || {},
      commissionRate: commissionRate || 10
    });

    await vendor.save();

    // Update user as vendor
    user.isVendor = true;
    user.vendorProfile = vendor._id;
    await user.save();

    await vendor.populate('user', 'firstName lastName email phone');

    return NextResponse.json({ 
      success: true,
      message: 'Vendor created successfully',
      data: { vendor }
    }, { status: 201 });
  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}