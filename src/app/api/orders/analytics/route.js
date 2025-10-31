import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ GET ORDER ANALYTICS
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(searchParams.get('endDate') || new Date());

    // Total orders count by status
    const statusCounts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'shipped'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.grandTotal' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.grandTotal' }
        }
      }
    ]);

    // Daily orders for chart
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.grandTotal' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return NextResponse.json({
      statusCounts,
      revenue: revenueData[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
      dailyOrders
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}