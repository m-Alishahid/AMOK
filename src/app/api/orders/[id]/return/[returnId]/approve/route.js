import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ APPROVE RETURN
export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { refundAmount } = await request.json();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await order.approveReturn(params.returnId, refundAmount);
    await order.populate('items.product', 'name thumbnail');

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
