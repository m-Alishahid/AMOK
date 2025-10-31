// // app/api/invoices/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from '@/lib/auth';
// import Invoice from '@/Models/Invoice';
// import Vendor from '@/Models/Vendor';
// import User from '@/Models/User';
// import connectDB from '@/lib/mongodb';

// export async function GET(request) {
//   try {
//     await connectDB();
//     const session = await getServerSession(request);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 10;
//     const type = searchParams.get('type');
//     const status = searchParams.get('status');
//     const vendorId = searchParams.get('vendorId');
    
//     const skip = (page - 1) * limit;

//     // Build filter based on user role
//     const filter = {};
    
//     // If vendor, only show their invoices
//     if (session.user.role === 'vendor' || session.user.isVendor) {
//       const vendor = await Vendor.findOne({ user: session.user.id });
//       if (!vendor) {
//         return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
//       }
//       filter.vendor = vendor._id;
//     } else if (vendorId) {
//       // Admin filtering by specific vendor
//       filter.vendor = vendorId;
//     }

//     if (type) filter.type = type;
//     if (status) filter.status = status;

//     const invoices = await Invoice.find(filter)
//       .populate('vendor', 'companyName contactPerson phone')
//       .populate('createdBy', 'firstName lastName email')
//       .populate('items.product', 'name images')
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     const total = await Invoice.countDocuments(filter);

//     return NextResponse.json({
//       success: true,
//       data: {
//         invoices,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     return NextResponse.json({ 
//       success: false,
//       error: error.message 
//     }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     await connectDB();
//     const session = await getServerSession(request);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const body = await request.json();
//     const { 
//       type, 
//       vendorId, 
//       items, 
//       subtotal, 
//       taxAmount = 0, 
//       totalAmount, 
//       notes, 
//       terms,
//       dueDate 
//     } = body;

//     // Validate vendor access
//     const vendor = await Vendor.findById(vendorId);
//     if (!vendor) {
//       return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
//     }

//     // If user is vendor, ensure they can only create invoices for themselves
//     if ((session.user.role === 'vendor' || session.user.isVendor) && vendor.user.toString() !== session.user.id) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     // Create invoice
//     const invoice = new Invoice({
//       type,
//       vendor: vendorId,
//       items: items.map(item => ({
//         product: item.productId,
//         productName: item.productName,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         totalPrice: item.totalPrice,
//         size: item.size,
//         color: item.color
//       })),
//       subtotal,
//       taxAmount,
//       totalAmount,
//       notes,
//       terms,
//       dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       createdBy: user._id,
//       status: 'Draft'
//     });

//     await invoice.save();

//     // Populate for response
//     await invoice.populate('vendor', 'companyName contactPerson');
//     await invoice.populate('createdBy', 'firstName lastName');

//     return NextResponse.json({
//       success: true,
//       message: 'Invoice created successfully',
//       data: { invoice }
//     }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ 
//       success: false,
//       error: error.message 
//     }, { status: 500 });
//   }
// }







// app/api/invoices/route.js - UPDATED
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
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

    // Validate vendor access
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // If user is vendor, ensure they can only create invoices for themselves
    if ((session.user.role === 'vendor' || session.user.isVendor) && vendor.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate stock for vendor sales
    if (type === 'vendor_sale') {
      for (const item of items) {
        const vendorProduct = vendor.products.find(p => 
          p.product.toString() === item.productId &&
          p.size === item.size &&
          p.color === item.color
        );

        if (!vendorProduct) {
          return NextResponse.json({ 
            error: `Product ${item.productName} not found in vendor's inventory` 
          }, { status: 400 });
        }

        if (vendorProduct.currentStock < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for ${item.productName}. Available: ${vendorProduct.currentStock}, Requested: ${item.quantity}` 
          }, { status: 400 });
        }
      }
    }

    // Determine initial status
    let initialStatus = 'Draft';
    if (session.user.role === 'vendor' || session.user.isVendor) {
      initialStatus = 'pending_approval';
    } else if (session.user.role === 'super_admin' || session.user.isAdmin) {
      initialStatus = 'approved';
    }

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
      status: initialStatus
    });

    await invoice.save();

    // If admin created and approved, update stock immediately
    if (initialStatus === 'Approved' && type === 'vendor_sale') {
      await invoice.updateVendorStock();
    }

    // Populate for response
    await invoice.populate('vendor', 'companyName contactPerson');
    await invoice.populate('createdBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      message: initialStatus === 'Pending Approval' 
        ? 'Invoice created successfully! Waiting for admin approval.' 
        : 'Invoice created and approved successfully!',
      data: { invoice }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}