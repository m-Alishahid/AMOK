// /app/api/dashboard/low-stock/route.js
import { NextResponse } from 'next/server';
import { getUniversalSession, isAdmin, isVendor } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/Models/Product';
import Vendor from '@/Models/Vendor';

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

    if (isVendor(session)) {
      return await getVendorLowStock(session);
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden' 
      }, { status: 403 });
    }

    return await getAdminLowStock();
  } catch (error) {
    console.error('Low stock fetch error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function getVendorLowStock(session) {
  const vendor = await Vendor.findOne({ user: session.user.id })
    .populate('products.product', 'name salePrice costPrice images')
    .select('products');

  if (!vendor) {
    return NextResponse.json({ 
      success: false,
      error: 'Vendor not found' 
    }, { status: 404 });
  }

  const lowStockProducts = vendor.products.filter(product => 
    product.currentStock <= 10
  ).map(product => ({
    id: product.product._id,
    name: product.product.name,
    currentStock: product.currentStock,
    allocatedStock: product.allocatedStock,
    soldStock: product.soldStock,
    salePrice: product.salePrice,
    costPrice: product.costPrice,
    vendorPrice: product.vendorPrice,
    profitPerPiece: product.profitPerPiece,
    size: product.size,
    color: product.color,
    fabric: product.fabric,
    image: product.product.images?.[0],
    alertLevel: getAlertLevel(product.currentStock)
  }));

  return NextResponse.json({
    success: true,
    data: {
      count: lowStockProducts.length,
      products: lowStockProducts,
      critical: lowStockProducts.filter(p => p.currentStock <= 3).length,
      warning: lowStockProducts.filter(p => p.currentStock > 3 && p.currentStock <= 10).length
    }
  });
}

async function getAdminLowStock() {
  // ✅ FIXED: Remove vendor population since Product model doesn't have vendor field
  const lowStockProducts = await Product.find({ 
    totalStock: { $lte: 10 },
    status: 'Active'
  })
    .select('name totalStock salePrice costPrice images category brand') // vendor field removed
    .sort({ totalStock: 1 });

  const formattedProducts = lowStockProducts.map(product => ({
    id: product._id,
    name: product.name,
    currentStock: product.totalStock,
    salePrice: product.salePrice,
    costPrice: product.costPrice,
    image: product.images?.[0],
    category: product.category,
    brand: product.brand,
    alertLevel: getAlertLevel(product.totalStock)
  }));

  // ✅ FIXED: Calculate unique vendors differently
  // Since products don't have vendor field, we can't count vendors
  // Alternative: Count unique categories or brands instead
  const uniqueCategories = [...new Set(formattedProducts.map(p => p.category))].length;
  const uniqueBrands = [...new Set(formattedProducts.map(p => p.brand))].length;

  return NextResponse.json({
    success: true,
    data: {
      count: formattedProducts.length,
      products: formattedProducts,
      critical: formattedProducts.filter(p => p.currentStock <= 3).length,
      warning: formattedProducts.filter(p => p.currentStock > 3 && p.currentStock <= 10).length,
      // ✅ FIXED: Replace vendors count with categories/brands
      categories: uniqueCategories,
      brands: uniqueBrands
    }
  });
}

function getAlertLevel(stock) {
  if (stock <= 3) return 'critical';
  if (stock <= 10) return 'warning';
  return 'normal';
}