// app/api/invoices/[id]/reject/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import Invoice from '@/Models/Invoice';
import Vendor from '@/Models/Vendor';
import connectDB from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can reject invoices
    if (session.user.role !== 'admin' && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { rejectionReason } = await request.json();

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'Pending Approval') {
      return NextResponse.json({ error: 'Invoice is not pending approval' }, { status: 400 });
    }

    // Update invoice status
    invoice.status = 'Rejected';
    invoice.rejectionReason = rejectionReason;
    await invoice.save();

    // Update vendor pending invoices count
    const vendor = await Vendor.findById(invoice.vendor);
    if (vendor) {
      vendor.pendingInvoices = Math.max(0, vendor.pendingInvoices - 1);
      await vendor.save();
    }

    await invoice.populate('vendor', 'companyName contactPerson');

    return NextResponse.json({
      success: true,
      message: 'Invoice rejected successfully',
      data: { invoice }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}