import { NextResponse } from 'next/server';
import { getServerSession , isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ GET ORDER BY ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await Order.findById(params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name thumbnail salePrice discountedPrice');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ✅ Check if user can view this order
    if (!isAdmin(session) && order.customer._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE ORDER
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();
    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name email')
     .populate('items.product', 'name thumbnail');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}