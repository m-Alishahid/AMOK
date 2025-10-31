// app/api/invoices/[id]/approve/route.js
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

    // Only admin can approve invoices
    if (session.user.role !== 'admin' && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { approvedBy } = await request.json();

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'Pending Approval') {
      return NextResponse.json({ error: 'Invoice is not pending approval' }, { status: 400 });
    }

    // Update invoice status
    invoice.status = 'Approved';
    invoice.approvedBy = approvedBy;
    invoice.approvedAt = new Date();
    await invoice.save();

    // Update vendor stock for sales invoices
    if (invoice.type === 'vendor_sale') {
      await invoice.updateVendorStock();
    }

    // Update vendor invoice counts
    const vendor = await Vendor.findById(invoice.vendor);
    if (vendor) {
      vendor.pendingInvoices = Math.max(0, vendor.pendingInvoices - 1);
      vendor.paidInvoices += 1;
      await vendor.save();
    }

    await invoice.populate('vendor', 'companyName contactPerson');
    await invoice.populate('approvedBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      message: 'Invoice approved successfully',
      data: { invoice }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

