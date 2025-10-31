// app/api/invoices/vendor/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Invoice from '@/Models/Invoice';
import connectDB from '@/lib/mongodb';

// GET invoices for specific vendor
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    const filter = { vendor: id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('items.product', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(filter);

    // Calculate vendor stats
    const stats = await Invoice.aggregate([
      { $match: { vendor: id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    return NextResponse.json({
      invoices,
      stats,
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