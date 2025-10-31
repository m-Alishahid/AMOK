// // app/api/invoices/[id]/approve/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from '@/lib/auth';
// import Invoice from '@/Models/Invoice';
// import Vendor from '@/Models/Vendor';
// import connectDB from '@/lib/mongodb';

// export async function PATCH(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession(request);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Only Super Admin can approve invoices
//     if (session.user.role !== 'super_admin' && !session.user.isAdmin) {
//       return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
//     }

//     const { id } = await params;
//     const { approvedBy } = await request.json();

//     const invoice = await Invoice.findById(id);
//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     if (invoice.status !== 'pending_approval') {
//       return NextResponse.json({ error: 'Invoice is not pending approval' }, { status: 400 });
//     }

//     // Update invoice status
//     invoice.status = 'approved';
//     invoice.approvedBy = approvedBy;
//     invoice.approvedAt = new Date();
//     await invoice.save();

//     // Update vendor stock for sales invoices
//     if (invoice.type === 'vendor_sale') {
//       await invoice.updateVendorStock();
//     }

//     // Update vendor invoice counts
//     const vendor = await Vendor.findById(invoice.vendor);
//     if (vendor) {
//       vendor.pendingInvoices = Math.max(0, vendor.pendingInvoices - 1);
//       vendor.paidInvoices += 1;
//       await vendor.save();
//     }

//     await invoice.populate('vendor', 'companyName contactPerson');
//     await invoice.populate('approvedBy', 'firstName lastName');

//     return NextResponse.json({
//       success: true,
//       message: 'Invoice approved successfully',
//       data: { invoice }
//     });
//   } catch (error) {
//     return NextResponse.json({ 
//       success: false,
//       error: error.message 
//     }, { status: 500 });
//   }
// }



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

    // Only Super Admin can approve invoices
    if (session.user.role !== 'super_admin' && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const { approvedBy } = await request.json();

    console.log('✅ Approving invoice:', id, 'by:', approvedBy);

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'pending_approval') {
      return NextResponse.json({ 
        error: 'Invoice is not pending approval',
        currentStatus: invoice.status 
      }, { status: 400 });
    }

    // ✅ USE THE APPROVE METHOD THAT UPDATES STOCK
    await invoice.approveInvoice(approvedBy || session.user.id);

    // ✅ UPDATE VENDOR STATS
    const vendor = await Vendor.findById(invoice.vendor);
    if (vendor) {
      // Update vendor invoice counts
      vendor.pendingInvoices = Math.max(0, (vendor.pendingInvoices || 0) - 1);
      vendor.approvedInvoices = (vendor.approvedInvoices || 0) + 1;
      
      // Update vendor financials for sales
      if (invoice.type === 'vendor_sale') {
        vendor.totalSales = (vendor.totalSales || 0) + invoice.totalAmount;
        vendor.outstandingBalance = (vendor.outstandingBalance || 0) + invoice.totalAmount;
      }
      
      await vendor.save();
      console.log('✅ Vendor stats updated');
    }

    // ✅ POPULATE THE RESPONSE
    await invoice.populate('vendor', 'companyName contactPerson phone email');
    await invoice.populate('approvedBy', 'firstName lastName');
    await invoice.populate('items.product', 'name images category');

    console.log('✅ Invoice approved successfully:', {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      stockUpdated: invoice.stockUpdated,
      totalAmount: invoice.totalAmount
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice approved and stock updated successfully',
      data: { 
        invoice,
        stockUpdate: {
          updated: invoice.stockUpdated,
          error: invoice.stockUpdateError
        }
      }
    });

  } catch (error) {
    console.error('❌ Invoice approval error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: 'Failed to approve invoice and update stock'
    }, { status: 500 });
  }
}