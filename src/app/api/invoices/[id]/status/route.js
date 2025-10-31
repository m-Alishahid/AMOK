// app/api/invoices/[id]/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Invoice from '@/Models/Invoice';
import connectDB from '@/lib/mongodb';

// UPDATE invoice status
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    const validStatuses = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('vendor', 'companyName contactPerson')
    .populate('createdBy', 'firstName lastName');

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Invoice status updated successfully',
      invoice
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}