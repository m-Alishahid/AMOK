import { NextResponse } from 'next/server';
import { getServerSession , isAdmin} from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ CANCEL ORDER
export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ✅ Check permissions
    if (!isAdmin(session) && order.customer.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!order.canBeCancelled()) {
      return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      requestedBy: isAdmin(session) ? 'admin' : 'customer',
      notes: 'Order cancelled by user'
    };

    await order.save();
    await order.populate('items.product', 'name thumbnail');

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}