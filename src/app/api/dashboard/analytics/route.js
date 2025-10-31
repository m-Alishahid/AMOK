import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/Models/Invoice';
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';

    if (isVendor(session)) {
      return await getVendorAnalytics(session, period);
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 });
    }

    return await getAdminAnalytics(period);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function getVendorAnalytics(session, period) {
  const vendor = await Vendor.findOne({ user: session.user.id });
  if (!vendor) {
    return NextResponse.json({ 
      success: false,
      error: 'Vendor not found' 
    }, { status: 404 });
  }

  const dateRange = getDateRange(period);
  
  const salesData = await Invoice.aggregate([
    {
      $match: {
        vendor: vendor._id,
        status: 'Paid',
        createdAt: { $gte: dateRange.start }
      }
    },
    {
      $group: {
        _id: getGrouping(period),
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$totalProfit' },
        orderCount: { $sum: 1 },
        averageOrder: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const topProducts = await Vendor.aggregate([
    { $match: { _id: vendor._id } },
    { $unwind: '$products' },
    { 
      $match: { 
        'products.soldStock': { $gt: 0 } 
      } 
    },
    {
      $project: {
        product: '$products.product',
        productName: '$products.product.name',
        soldStock: '$products.soldStock',
        totalRevenue: { $multiply: ['$products.vendorPrice', '$products.soldStock'] },
        totalProfit: { $multiply: ['$products.profitPerPiece', '$products.soldStock'] }
      }
    },
    { $sort: { soldStock: -1 } },
    { $limit: 10 }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      period,
      sales: salesData.map(item => ({
        period: formatPeriod(item._id, period),
        sales: item.totalSales,
        profit: item.totalProfit,
        orders: item.orderCount,
        averageOrder: item.averageOrder
      })),
      topProducts: topProducts.map(item => ({
        name: item.productName,
        sold: item.soldStock,
        revenue: item.totalRevenue,
        profit: item.totalProfit
      })),
      summary: {
        totalSales: salesData.reduce((sum, item) => sum + item.totalSales, 0),
        totalProfit: salesData.reduce((sum, item) => sum + item.totalProfit, 0),
        totalOrders: salesData.reduce((sum, item) => sum + item.orderCount, 0)
      }
    }
  });
}

async function getAdminAnalytics(period) {
  const dateRange = getDateRange(period);
  
  const salesData = await Invoice.aggregate([
    {
      $match: {
        status: 'Paid',
        createdAt: { $gte: dateRange.start }
      }
    },
    {
      $group: {
        _id: getGrouping(period),
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$totalProfit' },
        orderCount: { $sum: 1 },
        averageOrder: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const vendorPerformance = await Invoice.aggregate([
    {
      $match: {
        status: 'Paid',
        createdAt: { $gte: dateRange.start }
      }
    },
    {
      $group: {
        _id: '$vendor',
        totalSales: { $sum: '$totalAmount' },
        totalProfit: { $sum: '$totalProfit' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    { $unwind: '$vendor' },
    { $sort: { totalSales: -1 } },
    { $limit: 10 }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      period,
      sales: salesData.map(item => ({
        period: formatPeriod(item._id, period),
        sales: item.totalSales,
        profit: item.totalProfit,
        orders: item.orderCount,
        averageOrder: item.averageOrder
      })),
      vendorPerformance: vendorPerformance.map(item => ({
        vendor: item.vendor.companyName,
        sales: item.totalSales,
        profit: item.totalProfit,
        orders: item.orderCount
      })),
      summary: {
        totalSales: salesData.reduce((sum, item) => sum + item.totalSales, 0),
        totalProfit: salesData.reduce((sum, item) => sum + item.totalProfit, 0),
        totalOrders: salesData.reduce((sum, item) => sum + item.orderCount, 0),
        topVendors: vendorPerformance.length
      }
    }
  });
}

function getDateRange(period) {
  const now = new Date();
  let start = new Date();

  switch (period) {
    case 'daily':
      start.setDate(now.getDate() - 7);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 30);
      break;
    case 'monthly':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'yearly':
      start.setFullYear(now.getFullYear() - 3);
      break;
    default:
      start.setFullYear(now.getFullYear() - 1);
  }

  return { start, end: now };
}

function getGrouping(period) {
  switch (period) {
    case 'daily':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    case 'weekly':
      return {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    case 'monthly':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    case 'yearly':
      return {
        year: { $year: '$createdAt' }
      };
    default:
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
  }
}

function formatPeriod(id, period) {
  switch (period) {
    case 'daily':
      return `${id.year}-${id.month}-${id.day}`;
    case 'weekly':
      return `Week ${id.week}, ${id.year}`;
    case 'monthly':
      return `${id.year}-${id.month}`;
    case 'yearly':
      return `${id.year}`;
    default:
      return `${id.year}-${id.month}`;
  }
}