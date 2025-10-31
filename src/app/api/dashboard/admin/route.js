// app/api/dashboard/admin/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Vendor from '@/Models/Vendor';
import Product from '@/Models/Product';
import Invoice from '@/Models/Invoice';
import User from '@/Models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    console.log('Session', session);
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    // Get detailed admin stats
    const [
      vendors,
      products,
      invoices,
      users
    ] = await Promise.all([
      Vendor.find({ status: 'Active' })
        .populate('user', 'firstName lastName email')
        .select('companyName contactPerson totalAllocatedValue totalSoldValue totalProfit')
        .limit(10),
      Product.find({ status: 'Active' })
        .select('name totalStock salePrice costPrice')
        .sort({ totalStock: 1 })
        .limit(10),
      Invoice.find()
        .populate('vendor', 'companyName')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10),
      User.find({ isActive: true })
        .select('firstName lastName email roleType lastLogin')
        .sort({ lastLogin: -1 })
        .limit(10)
    ]);

    // Financial overview
    const financialStats = await Invoice.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $match: { status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          pendingInvoices: [
            { $match: { status: { $in: ['Draft', 'Sent'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          overdueInvoices: [
            { $match: { status: 'Overdue' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          vendors,
          products,
          invoices,
          users
        },
        financial: {
          totalRevenue: financialStats[0]?.totalRevenue[0]?.total || 0,
          pendingAmount: financialStats[0]?.pendingInvoices[0]?.total || 0,
          overdueAmount: financialStats[0]?.overdueInvoices[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}