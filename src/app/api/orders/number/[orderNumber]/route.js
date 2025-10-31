import { NextResponse } from 'next/server';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ GET ORDER BY ORDER NUMBER
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { orderNumber } = params;

    const order = await Order.findOne({ orderNumber })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name thumbnail');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
