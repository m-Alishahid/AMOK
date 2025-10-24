// // import { NextResponse } from 'next/server';
// // import connectDB from '@/lib/mongodb';
// // import Discount from '@/Models/Discount';

// // export async function POST() {
// //   try {
// //     await connectDB();
    
// //     const result = await Discount.updateDiscountStatuses();
    
// //     return NextResponse.json({
// //       success: true,
// //       data: result,
// //       message: `Updated discounts: ${result.expired} expired, ${result.activated} activated`
// //     });

// //   } catch (error) {
// //     console.error('Discount Status Update Error:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Failed to update discount statuses' },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Discount from '@/Models/Discount';

// export async function POST() {
//   try {
//     await connectDB();
    
//     const result = await Discount.updateDiscountStatuses();
    
//     return NextResponse.json({
//       success: true,
//       data: result,
//       message: `Updated discounts: ${result.expired} expired, ${result.activated} activated`
//     });

//   } catch (error) {
//     console.error('Discount Status Update Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to update discount statuses' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discount from '@/Models/Discount';

export async function POST() {
  try {
    await connectDB();
    
    console.log('🕒 Starting discount status update...');
    const result = await Discount.updateDiscountStatuses();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Updated discounts: ${result.expired} expired, ${result.activated} activated`
    });

  } catch (error) {
    console.error('❌ Discount Status Update Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update discount statuses' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    console.log('🕒 Checking discount statuses...');
    const result = await Discount.updateDiscountStatuses();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Checked discounts: ${result.expired} expired, ${result.activated} activated`
    });

  } catch (error) {
    console.error('❌ Discount Status Check Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check discount statuses' },
      { status: 500 }
    );
  }
}