// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Discount from '@/Models/Discount';
// import Product from '@/Models/Product';
// import mongoose from 'mongoose';

// // GET all discounts
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get('status');

//     let query = {};
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     const discounts = await Discount.find(query)
//       .populate('category')
//       .populate('products')
//       .populate('appliedProducts.product')
//       .sort({ createdAt: -1 });

//     return NextResponse.json({
//       success: true,
//       data: discounts
//     });
//   } catch (error) {
//     console.error('GET Discounts Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch discounts' },
//       { status: 500 }
//     );
//   }
// }

// // POST create and apply discount
// export async function POST(request) {
//   try {
//     await connectDB();
//     const body = await request.json();

//     console.log('Received discount data:', body);

//     // Validate required fields
//     const requiredFields = ['name', 'discountType', 'discountValue', 'scope', 'startDate', 'endDate'];
//     const missingFields = requiredFields.filter(field => !body[field]);
    
//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
//         { status: 400 }
//       );
//     }

//     // Clean and validate data
//     const cleanData = { 
//       ...body,
//       discountValue: parseFloat(body.discountValue)
//     };

//     // Validate dates
//     const startDate = new Date(cleanData.startDate);
//     const endDate = new Date(cleanData.endDate);
    
//     if (startDate >= endDate) {
//       return NextResponse.json(
//         { success: false, error: 'End date must be after start date' },
//         { status: 400 }
//       );
//     }

//     if (endDate <= new Date()) {
//       return NextResponse.json(
//         { success: false, error: 'End date must be in the future' },
//         { status: 400 }
//       );
//     }

//     // Validate scope-specific fields
//     if (cleanData.scope === 'category') {
//       if (!cleanData.category || !mongoose.Types.ObjectId.isValid(cleanData.category)) {
//         return NextResponse.json(
//           { success: false, error: 'Valid category ID is required for category scope' },
//           { status: 400 }
//         );
//       }
//     } else {
//       cleanData.category = undefined;
//     }

//     if (cleanData.scope === 'selected') {
//       if (!cleanData.products || !Array.isArray(cleanData.products) || cleanData.products.length === 0) {
//         return NextResponse.json(
//           { success: false, error: 'At least one product must be selected for selected scope' },
//           { status: 400 }
//         );
//       }

//       const invalidProductIds = cleanData.products.filter(
//         productId => !mongoose.Types.ObjectId.isValid(productId)
//       );
      
//       if (invalidProductIds.length > 0) {
//         return NextResponse.json(
//           { success: false, error: 'Invalid product IDs provided' },
//           { status: 400 }
//         );
//       }
//     } else {
//       cleanData.products = [];
//     }

//     // Set initial status based on start date
//     const now = new Date();
//     if (startDate > now) {
//       cleanData.status = 'Scheduled';
//     } else {
//       cleanData.status = 'Active';
//     }

//     // Create discount
//     const discount = await Discount.create(cleanData);

//     // Apply discount to products if it's active
//     if (discount.status === 'Active') {
//       await discount.applyToProducts();
//     }

//     // Populate and return the created discount
//     const populatedDiscount = await Discount.findById(discount._id)
//       .populate('category')
//       .populate('products')
//       .populate('appliedProducts.product');

//     return NextResponse.json({
//       success: true,
//       data: populatedDiscount,
//       message: `Discount created successfully${discount.status === 'Active' ? ` and applied to ${discount.totalProducts} products` : ''}`
//     }, { status: 201 });

//   } catch (error) {
//     console.error('POST Discount Error:', error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Validation failed',
//           details: errors 
//         },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to create discount',
//         details: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // DELETE discount
// export async function DELETE(request) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const discountId = searchParams.get('id');

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

//     // ✅ Remove discount from products and restore original prices
//     await discount.manualRemove();

//     // Delete the discount record
//     await Discount.findByIdAndDelete(discountId);

//     return NextResponse.json({
//       success: true,
//       message: 'Discount removed successfully and product prices restored'
//     });

//   } catch (error) {
//     console.error('DELETE Discount Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to remove discount' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discount from '@/Models/Discount';
import mongoose from 'mongoose';

// GET all discounts
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const discounts = await Discount.find(query)
      .populate('category')
      .populate('products')
      .populate('appliedProducts.product')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('GET Discounts Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// POST create and apply discount
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    console.log('📝 Received discount data:', body);

    // Validate required fields
    const requiredFields = ['name', 'discountType', 'discountValue', 'scope', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Clean and validate data
    const cleanData = { 
      ...body,
      discountValue: parseFloat(body.discountValue)
    };

    // Validate dates
    const startDate = new Date(cleanData.startDate);
    const endDate = new Date(cleanData.endDate);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (endDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    // Validate scope-specific fields
    if (cleanData.scope === 'category') {
      if (!cleanData.category || !mongoose.Types.ObjectId.isValid(cleanData.category)) {
        return NextResponse.json(
          { success: false, error: 'Valid category ID is required for category scope' },
          { status: 400 }
        );
      }
    } else {
      cleanData.category = undefined;
    }

    if (cleanData.scope === 'selected') {
      if (!cleanData.products || !Array.isArray(cleanData.products) || cleanData.products.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one product must be selected for selected scope' },
          { status: 400 }
        );
      }

      const invalidProductIds = cleanData.products.filter(
        productId => !mongoose.Types.ObjectId.isValid(productId)
      );
      
      if (invalidProductIds.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid product IDs provided' },
          { status: 400 }
        );
      }
    } else {
      cleanData.products = [];
    }

    // Set initial status based on start date
    const now = new Date();
    if (startDate > now) {
      cleanData.status = 'Scheduled';
    } else {
      cleanData.status = 'Active';
    }

    // Create discount
    const discount = await Discount.create(cleanData);

    // Apply discount to products if it's active
    if (discount.status === 'Active') {
      await discount.applyToProducts();
    }

    // Populate and return the created discount
    const populatedDiscount = await Discount.findById(discount._id)
      .populate('category')
      .populate('products')
      .populate('appliedProducts.product');

    return NextResponse.json({
      success: true,
      data: populatedDiscount,
      message: `Discount created successfully${discount.status === 'Active' ? ` and applied to ${discount.totalProducts} products` : ''}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST Discount Error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create discount',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE discount
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const discountId = searchParams.get('id');

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

    console.log(`🗑️ Starting DELETE for discount: ${discount.name}`);
    
    // Remove discount from products and restore original prices
    await discount.manualRemove();

    // Delete the discount record
    await Discount.findByIdAndDelete(discountId);

    return NextResponse.json({
      success: true,
      message: 'Discount deleted successfully and product prices restored'
    });

  } catch (error) {
    console.error('❌ DELETE Discount Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}