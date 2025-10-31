import { NextResponse } from 'next/server';
import { getServerSession , isAdmin } from '@/lib/auth';
import Order from '@/Models/Orders';
import Product from '@/Models/Product';
import  connectDB  from '@/lib/mongodb';

// ✅ GET ALL ORDERS (Admin only)
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const customer = searchParams.get('customer');

    let query = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email')
      .populate('items.product', 'name thumbnail');

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
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

// ✅ CREATE NEW ORDER
export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    const orderData = await request.json();

    // Allow guest orders without authentication
    if (!session && !orderData.isGuestOrder) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Validate stock before creating order
    for (let item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product}` }, { status: 400 });
      }

      const hasStock = product.checkStock(
        item.variant?.size,
        item.variant?.color,
        item.quantity
      );

      if (!hasStock) {
        return NextResponse.json({
          error: `Insufficient stock for product: ${product.name}`
        }, { status: 400 });
      }

      // ✅ Deduct stock immediately
      const stockUpdated = product.updateVariantStock(
        item.variant?.size,
        item.variant?.color,
        item.quantity
      );

      if (!stockUpdated) {
        return NextResponse.json({
          error: `Failed to update stock for: ${product.name}`
        }, { status: 400 });
      }

      await product.save();
    }

    // ✅ Create order
    const order = new Order({
      ...orderData,
      customer: session ? session.user.id : null // For guest orders, customer is null
    });

    await order.save();
    await order.populate('items.product', 'name thumbnail');

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
