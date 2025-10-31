// src/app/api/orders/customer/customerId/route.js
import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ GET ORDERS BY CUSTOMER
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Users can only see their own orders
    if (!isAdmin(session) && session.user.id !== params.customerId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;
    let query = { customer: params.customerId };
    
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name thumbnail');

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}