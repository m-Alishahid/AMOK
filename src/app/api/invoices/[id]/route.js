// // app/api/invoices/[id]/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import Invoice from '@/Models/Invoice';
// import connectDB from '@/lib/mongodb';

// // GET invoice by ID
// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession();
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const invoice = await Invoice.findById(id)
//       .populate('vendor', 'companyName contactPerson phone address')
//       .populate('createdBy', 'firstName lastName email')
//       .populate('items.product', 'name images costPrice salePrice');

//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     return NextResponse.json({ invoice });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // UPDATE invoice
// export async function PUT(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession();
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const body = await request.json();

//     const invoice = await Invoice.findByIdAndUpdate(
//       id, 
//       body, 
//       { new: true, runValidators: true }
//     )
//     .populate('vendor', 'companyName contactPerson')
//     .populate('createdBy', 'firstName lastName');

//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: 'Invoice updated successfully',
//       invoice
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // DELETE invoice
// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession();
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const invoice = await Invoice.findByIdAndDelete(id);

//     if (!invoice) {
//       return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: 'Invoice deleted successfully'
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// app/api/invoices/route.js - UPDATED WITH APPROVAL
import { NextResponse } from 'next/server';
import { getServerSession, getUniversalSession, isAdmin } from '@/lib/auth';
import Invoice from '@/Models/Invoice';
import Vendor from '@/Models/Vendor';
import User from '@/Models/User';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const pendingApproval = searchParams.get('pendingApproval');
    
    const skip = (page - 1) * limit;

    // Build filter based on user role
    const filter = {};
    
    // If vendor, only show their invoices
    if (session.user.role === 'vendor' || session.user.isVendor) {
      const vendor = await Vendor.findOne({ user: session.user.id });
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }
      filter.vendor = vendor._id;
    } else if (vendorId) {
      // Admin filtering by specific vendor
      filter.vendor = vendorId;
    }

    // Pending approval filter for admin
    if (pendingApproval === 'true' && (session.user.role === 'admin' || session.user.isAdmin)) {
      filter.status = 'Pending Approval';
    }

    if (type) filter.type = type;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('vendor', 'companyName contactPerson phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .populate('items.product', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      type, 
      vendorId, 
      items, 
      subtotal, 
      taxAmount = 0, 
      totalAmount, 
      notes, 
      terms,
      dueDate 
    } = body;

    // Validate vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // If user is vendor, ensure they can only create invoices for themselves
    if ((session.user.role === 'vendor' || session.user.isVendor) && vendor.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Auto-approve if created by admin
    const isAdmin = session.user.role === 'admin' || session.user.isAdmin;
    const status = isAdmin ? 'Approved' : 'Pending Approval';

    // Create invoice
    const invoice = new Invoice({
      type,
      vendor: vendorId,
      items: items.map(item => ({
        product: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        costPrice: item.costPrice,
        vendorPrice: item.vendorPrice,
        size: item.size,
        color: item.color
      })),
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      terms,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: user._id,
      status: status,
      requiresApproval: !isAdmin
    });

    await invoice.save();

    // Auto-update stock if approved by admin
    if (isAdmin && type === 'vendor_sale') {
      await invoice.updateVendorStock();
      
      // Update vendor invoice counts
      vendor.totalInvoices += 1;
      vendor.paidInvoices += 1;
      await vendor.save();
    } else if (!isAdmin) {
      // Update vendor pending invoices count
      vendor.totalInvoices += 1;
      vendor.pendingInvoices += 1;
      await vendor.save();
    }

    // Populate for response
    await invoice.populate('vendor', 'companyName contactPerson');
    await invoice.populate('createdBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      message: isAdmin ? 'Invoice created and approved successfully' : 'Invoice created successfully! Waiting for admin approval.',
      data: { invoice }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}


export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await request.json();

    // Find existing invoice
    const existingInvoice = await Invoice.findById(id)
      .populate('vendor', 'products');
    
    if (!existingInvoice) {
      return NextResponse.json({ 
        success: false,
        error: 'Invoice not found' 
      }, { status: 404 });
    }

    // Validate invoice status for editing
    if (existingInvoice.status === 'Paid') {
      return NextResponse.json({ 
        success: false,
        error: 'Cannot edit paid invoices' 
      }, { status: 400 });
    }

    // Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('vendor', 'companyName contactPerson phone address')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    // Update vendor stock if items changed
    if (updateData.items) {
      await updateVendorStock(existingInvoice, updateData.items);
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });

  } catch (error) {
    console.error('Invoice update error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

async function updateVendorStock(oldInvoice, newItems) {
  const vendor = await Vendor.findById(oldInvoice.vendor);
  
  // Revert old stock allocations
  for (const oldItem of oldInvoice.items) {
    const vendorProduct = vendor.products.find(p => 
      p.product.toString() === oldItem.product.toString()
    );
    
    if (vendorProduct) {
      vendorProduct.currentStock += oldItem.quantity;
      vendorProduct.soldStock -= oldItem.quantity;
    }
  }

  // Apply new stock allocations
  for (const newItem of newItems) {
    const vendorProduct = vendor.products.find(p => 
      p.product.toString() === newItem.product.toString()
    );
    
    if (vendorProduct) {
      vendorProduct.currentStock -= newItem.quantity;
      vendorProduct.soldStock += newItem.quantity;
    }
  }

  await vendor.save();
}