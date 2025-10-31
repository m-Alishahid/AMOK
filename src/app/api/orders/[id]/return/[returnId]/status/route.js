import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import connectDB from '@/lib/mongodb';

// ✅ UPDATE RETURN STATUS
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, notes } = await request.json();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update return status
    const returnItem = order.returns.id(params.returnId);
    if (!returnItem) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    // Validate status
    const validStatuses = ['requested', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    returnItem.status = status;
    returnItem.processedAt = new Date();

    // Add admin notes if provided
    if (notes) {
      order.adminNotes.push({
        note: `Return ${params.returnId} status updated to ${status}: ${notes}`,
        createdBy: session.user.id
      });
    }

    await order.save();
    await order.populate('items.product', 'name thumbnail');

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
