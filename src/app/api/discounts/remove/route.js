// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Discount from '@/Models/Discount';

// export async function POST(request) {
//   try {
//     await connectDB();
//     const { discountId } = await request.json();

//     if (!discountId) {
//       return NextResponse.json(
//         { success: false, error: 'Discount ID is required' },
//         { status: 400 }
//       );
//     }

//     const discount = await Discount.findById(discountId);
//     if (!discount) {
//       return NextResponse.json(
//         { success: false, error: 'Discount not found' },
//         { status: 404 }
//       );
//     }

//     // ✅ Remove discount and restore original prices
//     await discount.manualRemove();

//     return NextResponse.json({
//       success: true,
//       message: 'Discount removed successfully and original prices restored'
//     });

//   } catch (error) {
//     console.error('Remove Discount Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to remove discount' },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discount from '@/Models/Discount';

export async function POST(request) {
  try {
    await connectDB();
    const { discountId } = await request.json();

    if (!discountId) {
      return NextResponse.json(
        { success: false, error: 'Discount ID is required' },
        { status: 400 }
      );
    }

    const discount = await Discount.findById(discountId);
    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    console.log(`🔄 Starting manual removal of discount: ${discount.name}`);
    
    // Remove discount and restore original prices
    const restoredCount = await discount.manualRemove();

    return NextResponse.json({
      success: true,
      data: {
        restoredProducts: restoredCount,
        totalProducts: discount.appliedProducts.length
      },
      message: `Discount removed successfully! ${restoredCount} products restored to original prices.`
    });

  } catch (error) {
    console.error('❌ Remove Discount Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove discount',
        details: error.message 
      },
      { status: 500 }
    );
  }
}