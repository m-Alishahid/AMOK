import { NextResponse } from 'next/server';
import { getServerSession , isAdmin} from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ REQUEST RETURN
export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, reason, quantity } = await request.json();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

// ✅ Users can only return their own orders
    if (!isAdmin(session) && order.customer.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!order.canBeReturned()) {
      return NextResponse.json({ error: 'Order cannot be returned' }, { status: 400 });
    }

    await order.processReturn(itemId, reason, quantity);
    await order.populate('items.product', 'name thumbnail');

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}