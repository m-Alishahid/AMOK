import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discount from '@/Models/Discount';
import Product from '@/Models/Product';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Find active discounts that have expired
    const expiredDiscounts = await Discount.find({
      status: 'Active',
      endDate: { $lt: now },
      autoRemove: true
    });

    let expiredCount = 0;

    for (const discount of expiredDiscounts) {
      let filter = {};
      switch (discount.scope) {
        case 'all':
          filter = { discountedPrice: { $gt: 0 } };
          break;
        case 'category':
          filter = { category: discount.category, discountedPrice: { $gt: 0 } };
          break;
        case 'selected':
          filter = { _id: { $in: discount.products }, discountedPrice: { $gt: 0 } };
          break;
      }

      // Reset discounted prices for affected products
      await Product.updateMany(filter, {
        $set: {
          discountedPrice: 0,
          discountPercentage: 0
        }
      });

      // Update discount status to expired
      discount.status = 'Expired';
      await discount.save();
      
      expiredCount++;
      console.log(`Discount "${discount.name}" expired and removed from products`);
    }

    // Also activate scheduled discounts that should be active
    const activatedCount = await Discount.updateMany(
      {
        status: 'Scheduled',
        startDate: { $lte: now },
        endDate: { $gte: now }
      },
      {
        $set: { status: 'Active' }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        expired: expiredCount,
        activated: activatedCount.modifiedCount || 0
      },
      message: `Expired ${expiredCount} discount(s) and activated ${activatedCount.modifiedCount || 0} discount(s)`
    });

  } catch (error) {
    console.error('Discount Expiry Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check discount expiry' },
      { status: 500 }
    );
  }
}