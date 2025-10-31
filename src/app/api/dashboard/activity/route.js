import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/Models/Invoice';
import Vendor from '@/Models/Vendor';
import Product from '@/Models/Product';

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getUniversalSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (isVendor(session)) {
      return await getVendorActivity(session, limit);
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 });
    }

    return await getAdminActivity(limit);
  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function getVendorActivity(session, limit) {
  const vendor = await Vendor.findOne({ user: session.user.id });
  if (!vendor) {
    return NextResponse.json({ 
      success: false,
      error: 'Vendor not found' 
    }, { status: 404 });
  }

  const activities = await Invoice.find({ vendor: vendor._id })
    .populate('createdBy', 'firstName lastName')
    .populate('vendor', 'companyName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('invoiceNumber type status totalAmount createdAt createdBy vendor');

  const formattedActivities = activities.map(invoice => ({
    id: invoice._id,
    type: 'invoice',
    title: `Invoice ${invoice.invoiceNumber} ${invoice.status}`,
    description: `${invoice.type} invoice for ${invoice.vendor?.companyName || 'Vendor'}`,
    amount: invoice.totalAmount,
    user: invoice.createdBy,
    timestamp: invoice.createdAt,
    status: invoice.status
  }));

  return NextResponse.json({
    success: true,
    data: formattedActivities
  });
}

async function getAdminActivity(limit) {
  // Get invoices with vendor info
  const activities = await Invoice.find()
    .populate('createdBy', 'firstName lastName')
    .populate('vendor', 'companyName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('invoiceNumber type status totalAmount createdAt createdBy vendor');

  // ✅ FIXED: Product updates without vendor population
  const productUpdates = await Product.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('name totalStock updatedAt'); // vendor field removed

  const formattedInvoices = activities.map(invoice => ({
    id: invoice._id,
    type: 'invoice',
    title: `Invoice ${invoice.invoiceNumber} ${invoice.status}`,
    description: `${invoice.type} invoice for ${invoice.vendor?.companyName || 'System'}`,
    amount: invoice.totalAmount,
    user: invoice.createdBy,
    timestamp: invoice.createdAt,
    status: invoice.status
  }));

  // ✅ FIXED: Product activities without vendor info
  const formattedProducts = productUpdates.map(product => ({
    id: product._id,
    type: 'product',
    title: `Product ${product.name} updated`,
    description: `Stock updated to ${product.totalStock} units`,
    timestamp: product.updatedAt
  }));

  const allActivities = [...formattedInvoices, ...formattedProducts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);

  return NextResponse.json({
    success: true,
    data: allActivities
  });
}