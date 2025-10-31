// app/api/dashboard/vendor/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vendor from '@/Models/Vendor';
import Invoice from '@/Models/Invoice';
import User from '@/Models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session || !isVendor(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Vendor access required' 
      }, { status: 401 });
    }

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

    // Get vendor-specific data
    const [recentInvoices, salesData, topProducts] = await Promise.all([
      Invoice.find({ vendor: vendor._id })
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5),
      Invoice.aggregate([
        {
          $match: {
            vendor: vendor._id,
            status: 'Paid',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalSales: { $sum: '$totalAmount' },
            totalProfit: { $sum: '$totalProfit' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      // Top selling products
      Vendor.aggregate([
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
        { $limit: 5 }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        vendor: {
          _id: vendor._id,
          companyName: vendor.companyName,
          contactPerson: vendor.contactPerson,
          products: vendor.products,
          status: vendor.status
        },
        recentInvoices,
        salesData: salesData.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          sales: item.totalSales,
          profit: item.totalProfit,
          orders: item.count
        })),
        topProducts: topProducts.map(item => ({
          product: item.product,
          productName: item.productName,
          soldStock: item.soldStock,
          totalRevenue: item.totalRevenue,
          totalProfit: item.totalProfit
        }))
      }
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}