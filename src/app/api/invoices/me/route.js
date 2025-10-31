// app/api/invoices/me/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Invoice from '@/Models/Invoice';
import User from '@/Models/User';
import Vendor from '@/Models/Vendor';
import connectDB from '@/lib/mongodb';

// GET my invoices (for vendors)
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.isVendor) {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    const filter = { vendor: vendor._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('items.product', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(filter);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}