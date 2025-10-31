import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vendor from '@/Models/Vendor';

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (isVendor(session)) {
      return await getVendorPendingRequests(session);
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 });
    }

    return await getAdminPendingRequests();
  } catch (error) {
    console.error('Pending requests fetch error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function getVendorPendingRequests(session) {
  const vendor = await Vendor.findOne({ user: session.user.id })
    .populate('deleteRequests.product', 'name images')
    .select('deleteRequests status');

  if (!vendor) {
    return NextResponse.json({ 
      success: false,
      error: 'Vendor not found' 
    }, { status: 404 });
  }

  const pendingRequests = vendor.deleteRequests.filter(req => 
    req.status === 'Pending'
  ).map(request => ({
    id: request._id,
    product: {
      id: request.product._id,
      name: request.product.name,
      image: request.product.images?.[0]
    },
    reason: request.reason,
    requestedAt: request.requestedAt,
    status: request.status,
    type: 'product_deletion'
  }));

  return NextResponse.json({
    success: true,
    data: {
      count: pendingRequests.length,
      requests: pendingRequests
    }
  });
}

async function getAdminPendingRequests() {
  const vendorsWithRequests = await Vendor.find({
    'deleteRequests.status': 'Pending'
  })
    .populate('user', 'firstName lastName email')
    .populate('deleteRequests.product', 'name images salePrice costPrice')
    .select('companyName contactPerson deleteRequests user');

  const allRequests = vendorsWithRequests.flatMap(vendor => 
    vendor.deleteRequests
      .filter(req => req.status === 'Pending')
      .map(request => ({
        id: request._id,
        vendor: {
          id: vendor._id,
          companyName: vendor.companyName,
          contactPerson: vendor.contactPerson,
          user: vendor.user
        },
        product: {
          id: request.product._id,
          name: request.product.name,
          image: request.product.images?.[0],
          salePrice: request.product.salePrice,
          costPrice: request.product.costPrice
        },
        reason: request.reason,
        requestedAt: request.requestedAt,
        status: request.status,
        type: 'product_deletion'
      }))
  );

  // You can add other types of requests here (vendor registrations, etc.)
  const vendorRegistrations = await Vendor.find({ status: 'Pending' })
    .populate('user', 'firstName lastName email')
    .select('companyName contactPerson phone address status createdAt');

  const registrationRequests = vendorRegistrations.map(vendor => ({
    id: vendor._id,
    vendor: {
      id: vendor._id,
      companyName: vendor.companyName,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      address: vendor.address,
      user: vendor.user
    },
    requestedAt: vendor.createdAt,
    status: vendor.status,
    type: 'vendor_registration'
  }));

  const allPendingRequests = [...allRequests, ...registrationRequests]
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  return NextResponse.json({
    success: true,
    data: {
      count: allPendingRequests.length,
      deletionRequests: allRequests.length,
      registrationRequests: registrationRequests.length,
      requests: allPendingRequests
    }
  });
}