import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import Vendor from '@/Models/Vendor';
import connectDB from '@/lib/mongodb';

// GET logged-in vendor's products
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(request);
    
    if (!session || !session.user.isVendor) {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    const vendor = await Vendor.findOne({ user: session.user.id })
      .populate('products.product', 'name images costPrice salePrice category brand')
      .select('products companyName');

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Filter only active products
    const activeProducts = vendor.products.filter(p => 
      p.status === 'Active' && p.currentStock > 0
    );

    return NextResponse.json({
      success: true,
      data: {
        products: activeProducts.map(p => ({
          id: p.product._id,
          name: p.product.name,
          images: p.product.images,
          costPrice: p.costPrice || p.product.costPrice,
          salePrice: p.salePrice || p.product.salePrice,
          allocatedStock: p.allocatedStock,
          currentStock: p.currentStock,
          size: p.size,
          color: p.color,
          fabric: p.fabric,
          vendorPrice: p.vendorPrice,
          profitPerPiece: p.profitPerPiece
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}