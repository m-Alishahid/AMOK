import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ UPDATE ORDER STATUS
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
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