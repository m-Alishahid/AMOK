import { NextResponse } from 'next/server';
import { mockOrders } from '../../../lib/orders';

const orders = [...mockOrders];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const newOrder = {
      id: (orders.length + 1).toString(),
      ...body,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    orders.push(newOrder);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { id, status } = await request.json();

    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[orderIndex].status = status;
    return NextResponse.json(orders[orderIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
