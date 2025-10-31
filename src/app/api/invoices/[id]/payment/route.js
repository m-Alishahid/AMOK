// app/api/invoices/[id]/payment/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Invoice from '@/Models/Invoice';
import connectDB from '@/lib/mongodb';

// RECORD payment for invoice
export async function POST(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { amount, paymentMethod, notes } = await request.json();

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update invoice
    invoice.status = 'Paid';
    invoice.paymentDate = new Date();
    await invoice.save();

    await invoice.populate('vendor', 'companyName contactPerson');

    return NextResponse.json({
      message: 'Payment recorded successfully',
      invoice
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}