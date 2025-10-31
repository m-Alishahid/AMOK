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

//     const { id } = await params;

//     console.log('💰 Processing payment for invoice:', id);

//     const invoice = await Invoice.findById(id);
//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     console.log('📄 Invoice found:', {
//       id: invoice._id,
//       number: invoice.invoiceNumber,
//       status: invoice.status,
//       totalAmount: invoice.totalAmount
//     });

//     if (invoice.status !== 'approved') {
//       return NextResponse.json({ 
//         error: 'Invoice must be approved before payment',
//         currentStatus: invoice.status 
//       }, { status: 400 });
//     }

//     // ✅ MARK INVOICE AS PAID
//     await invoice.markAsPaid();

//     // ✅ UPDATE VENDOR PAYMENT STATS
//     const vendor = await Vendor.findById(invoice.vendor);
//     if (vendor) {
//       // Reduce approved invoices count
//       vendor.approvedInvoices = Math.max(0, (vendor.approvedInvoices || 0) - 1);
      
//       // Increase paid invoices count
//       vendor.paidInvoices = (vendor.paidInvoices || 0) + 1;
      
//       // Update total revenue
//       vendor.totalRevenue = (vendor.totalRevenue || 0) + invoice.totalAmount;
      
//       await vendor.save();
//       console.log('✅ Vendor payment stats updated');
//     }

//     // Populate the paid invoice
//     await invoice.populate('vendor', 'companyName contactPerson phone');
//     await invoice.populate('items.product', 'name images');

//     console.log('✅ Invoice payment completed successfully');

//     return NextResponse.json({
//       success: true,
//       message: 'Invoice marked as paid successfully',
//       data: { invoice }
//     });
//   } catch (error) {
//     console.error('❌ Invoice payment error:', error);
//     return NextResponse.json({ 
//       success: false,
//       error: error.message,
//       details: 'Failed to process payment'
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

    const { id } = await params;

    console.log('💰 Processing payment for invoice:', id);

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    console.log('📄 Invoice found:', {
      id: invoice._id,
      number: invoice.invoiceNumber,
      status: invoice.status,
      type: invoice.type,
      totalAmount: invoice.totalAmount,
      stockUpdated: invoice.stockUpdated
    });

    if (invoice.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Invoice must be approved before payment',
        currentStatus: invoice.status 
      }, { status: 400 });
    }

    // ✅ MARK INVOICE AS PAID (NO STOCK UPDATE)
    await invoice.markAsPaid();

    // ✅ UPDATE VENDOR PAYMENT STATS ONLY
    const vendor = await Vendor.findById(invoice.vendor);
    if (vendor) {
      // Reduce approved invoices count
      vendor.approvedInvoices = Math.max(0, (vendor.approvedInvoices || 0) - 1);
      
      // Increase paid invoices count
      vendor.paidInvoices = (vendor.paidInvoices || 0) + 1;
      
      // Update financials
      vendor.totalRevenue = (vendor.totalRevenue || 0) + invoice.totalAmount;
      vendor.outstandingBalance = Math.max(0, (vendor.outstandingBalance || 0) - invoice.totalAmount);
      
      await vendor.save();
      console.log('✅ Vendor payment stats updated');
    }

    // Populate the paid invoice
    await invoice.populate('vendor', 'companyName contactPerson phone');
    await invoice.populate('items.product', 'name images');

    console.log('✅ Invoice payment completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: { 
        invoice,
        note: 'Stock was already updated during approval process'
      }
    });
  } catch (error) {
    console.error('❌ Invoice payment error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: 'Failed to process payment'
    }, { status: 500 });
  }
}