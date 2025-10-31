// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vendor from '@/Models/Vendor';
import Product from '@/Models/Product';
import Invoice from '@/Models/Vendor';
import User from '@/Models/User';
import Order from '@/Models/Orders';

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please login again' 
      }, { status: 401 });
    }

    // Vendor-specific dashboard
    if (isVendor(session)) {
      return await getVendorDashboard(session);
    }

    console.log('Session Data', session);
    
    // Admin dashboard (only for admin users)
    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    return await getAdminDashboard();
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// ✅ VENDOR DASHBOARD
async function getVendorDashboard(session) {
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ 
      success: false,
      error: 'User not found' 
    }, { status: 404 });
  }

  const vendor = await Vendor.findOne({ user: user._id })
    .populate('products.product', 'name salePrice costPrice images variants')
    .populate('user', 'firstName lastName email');

  if (!vendor) {
    return NextResponse.json({ 
      success: false,
      error: 'Vendor profile not found' 
    }, { status: 404 });
  }

  // Get vendor invoices
  const vendorInvoices = await Invoice.find({ vendor: vendor._id })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate vendor stats
  const totalProducts = vendor.products.length;
  const currentStock = vendor.products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
  const soldStock = vendor.products.reduce((sum, p) => sum + (p.soldStock || 0), 0);
  const totalSales = vendor.totalSoldValue || 0;
  const totalAllocatedValue = vendor.totalAllocatedValue || 0;
  const outstandingBalance = vendor.outstandingBalance || 0;
  const totalProfit = vendor.totalProfit || 0;

  // Calculate low stock products
  const lowStockProducts = vendor.products.filter(p => p.currentStock <= 10).length;

  // Recent sales (last 7 days)
  const recentSales = await Invoice.aggregate([
    {
      $match: {
        vendor: vendor._id,
        status: 'Paid',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const vendorStats = {
    totalProducts,
    currentStock,
    soldStock,
    totalSales,
    totalAllocatedValue,
    outstandingBalance,
    totalProfit,
    lowStockProducts,
    pendingRequests: vendor.deleteRequests?.filter(req => req.status === 'Pending').length || 0,
    recentSales: recentSales[0]?.totalSales || 0,
    recentOrders: recentSales[0]?.count || 0
  };

  return NextResponse.json({
    success: true,
    data: {
      stats: vendorStats,
      vendor: {
        _id: vendor._id,
        companyName: vendor.companyName,
        contactPerson: vendor.contactPerson,
        products: vendor.products,
        status: vendor.status
      },
      recentInvoices: vendorInvoices,
      lowStockProducts: vendor.products.filter(p => p.currentStock <= 10)
    }
  });
}

// ✅ ADMIN DASHBOARD
async function getAdminDashboard() {
  // Get all stats in parallel for better performance
  const [
    totalVendors,
    totalProducts,
    totalUsers,
    recentInvoices,
    lowStockProducts,
    totalOrders,
    recentOrders
  ] = await Promise.all([
    Vendor.countDocuments({ status: 'Active' }),
    Product.countDocuments({ status: 'Active' }),
    User.countDocuments({ isActive: true }),
    Invoice.find()
      .populate('vendor', 'companyName contactPerson')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5),
    Product.countDocuments({ totalStock: { $lt: 10 } }),
    Order.countDocuments(),
    Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name thumbnail')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  // Get financial stats
  const [salesData, pendingRequests] = await Promise.all([
    Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { 
        $group: { 
          _id: null, 
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$totalProfit' },
          count: { $sum: 1 }
        } 
      }
    ]),
    Vendor.aggregate([
      { $unwind: '$deleteRequests' },
      { $match: { 'deleteRequests.status': 'Pending' } },
      { $count: 'count' }
    ])
  ]);

  // Get monthly sales data for charts
  const monthlySales = await Invoice.aggregate([
    {
      $match: {
        status: 'Paid',
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$totalProfit' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  const totalSales = salesData[0]?.totalSales || 0;
  const totalProfit = salesData[0]?.totalProfit || 0;
  const totalInvoices = salesData[0]?.count || 0;

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalVendors,
        totalProducts,
        totalUsers,
        totalSales,
        totalProfit,
        totalInvoices,
        totalOrders,
        pendingRequests: pendingRequests[0]?.count || 0,
        lowStockProducts
      },
      charts: {
        monthlySales: monthlySales.map(item => ({
          month: `${item._id.year}-${item._id.month}`,
          sales: item.totalSales,
          profit: item.totalProfit,
          orders: item.count
        }))
      },
      recentInvoices,
      recentOrders,
      lowStockProducts: await Product.find({ totalStock: { $lt: 10 } })
        .select('name totalStock salePrice costPrice')
        .limit(10)
    }
  });
}