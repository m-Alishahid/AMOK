// // app/api/vendors/[id]/allocated-products/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from '@/lib/auth';
// import Vendor from '@/Models/Vendor';
// import connectDB from '@/lib/mongodb';

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const session = await getServerSession(request);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = await params;

//     // Get vendor with populated products
//     const vendor = await Vendor.findById(id)
//       .populate({
//         path: 'products.product',
//         select: 'name description images costPrice salePrice category'
//       });

//     if (!vendor) {
//       return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
//     }

//     // Check access rights
//     if (session.user.role === 'vendor' || session.user.isVendor) {
//       if (vendor.user.toString() !== session.user.id) {
//         return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//       }
//     }

//     // Filter only active products
//     const activeProducts = vendor.products.filter(p => 
//       p.status === 'Active' && p.currentStock > 0
//     );

//     return NextResponse.json({
//       success: true,
//       data: {
//         products: activeProducts,
//         totalProducts: activeProducts.length,
//         totalStock: activeProducts.reduce((sum, p) => sum + p.currentStock, 0)
//       }
//     });
//   } catch (error) {
//     return NextResponse.json({ 
//       success: false,
//       error: error.message 
//     }, { status: 500 });
//   }
// }





// app/api/vendors/[id]/allocated-products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import Vendor from '@/Models/Vendor';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { id } = await params;
    
    console.log('Fetching allocated products for vendor:', id);

    // Validate vendor ID format
    if (!id || id === 'allocated-products' || id === 'undefined') {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid vendor ID' 
      }, { status: 400 });
    }

    // Get vendor with populated products
    const vendor = await Vendor.findById(id)
      .populate({
        path: 'products.product',
        select: 'name description images costPrice salePrice category sku barcode'
      });

    if (!vendor) {
      return NextResponse.json({ 
        success: false,
        error: 'Vendor not found' 
      }, { status: 404 });
    }

    // Check access rights
    const isAdminUser = session.user.role === 'super_admin' || session.user.isAdmin;
    const isVendorUser = session.user.role === 'vendor' || session.user.isVendor;
    
    if (isVendorUser && vendor.user.toString() !== session.user.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied - You can only view your own products' 
      }, { status: 403 });
    }

    // Filter only active products with current stock > 0
    const activeProducts = vendor.products.filter(p => 
      p.status === 'Active' && p.currentStock > 0
    ).map(product => ({
      _id: product._id,
      product: product.product,
      allocatedStock: product.allocatedStock,
      currentStock: product.currentStock,
      soldStock: product.soldStock,
      size: product.size,
      color: product.color,
      fabric: product.fabric,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      vendorPrice: product.vendorPrice,
      profitPerPiece: product.profitPerPiece,
      totalProfit: product.totalProfit,
      allocatedAt: product.allocatedAt,
      status: product.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: activeProducts,
        totalProducts: activeProducts.length,
        totalStock: activeProducts.reduce((sum, p) => sum + p.currentStock, 0),
        vendorInfo: {
          companyName: vendor.companyName,
          contactPerson: vendor.contactPerson
        }
      }
    });
  } catch (error) {
    console.error('Get allocated products error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch allocated products',
      details: error.message 
    }, { status: 500 });
  }
}