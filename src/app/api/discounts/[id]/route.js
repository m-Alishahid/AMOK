// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Discount from '@/Models/Discount';
// import Product from '@/Models/Product';
// import mongoose from 'mongoose';

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid discount ID' },
//         { status: 400 }
//       );
//     }

//     const discount = await Discount.findById(id)
//       .populate('category')
//       .populate('products')
//       .populate('appliedProducts.product');

//     if (!discount) {
//       return NextResponse.json(
//         { success: false, error: 'Discount not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: discount
//     });

//   } catch (error) {
//     console.error('GET Discount Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch discount' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;
//     const body = await request.json();

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid discount ID' },
//         { status: 400 }
//       );
//     }

//     const discount = await Discount.findById(id);
//     if (!discount) {
//       return NextResponse.json(
//         { success: false, error: 'Discount not found' },
//         { status: 404 }
//       );
//     }

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
//     const updateData = { 
//       ...body,
//       discountValue: parseFloat(body.discountValue),
//       updatedAt: new Date()
//     };

//     // Validate dates
//     const startDate = new Date(updateData.startDate);
//     const endDate = new Date(updateData.endDate);
    
//     if (startDate >= endDate) {
//       return NextResponse.json(
//         { success: false, error: 'End date must be after start date' },
//         { status: 400 }
//       );
//     }

//     // Validate scope-specific fields
//     if (updateData.scope === 'category') {
//       if (!updateData.category || !mongoose.Types.ObjectId.isValid(updateData.category)) {
//         return NextResponse.json(
//           { success: false, error: 'Valid category ID is required for category scope' },
//           { status: 400 }
//         );
//       }
//     } else {
//       updateData.category = undefined;
//     }

//     if (updateData.scope === 'selected') {
//       if (!updateData.products || !Array.isArray(updateData.products) || updateData.products.length === 0) {
//         return NextResponse.json(
//           { success: false, error: 'At least one product must be selected for selected scope' },
//           { status: 400 }
//         );
//       }

//       const invalidProductIds = updateData.products.filter(
//         productId => !mongoose.Types.ObjectId.isValid(productId)
//       );
      
//       if (invalidProductIds.length > 0) {
//         return NextResponse.json(
//           { success: false, error: 'Invalid product IDs provided' },
//           { status: 400 }
//         );
//       }
//     } else {
//       updateData.products = [];
//     }

//     // Set status based on dates
//     const now = new Date();
//     if (startDate > now) {
//       updateData.status = 'Scheduled';
//     } else if (endDate < now) {
//       updateData.status = 'Expired';
//     } else {
//       updateData.status = 'Active';
//     }

//     // First remove discount from current products
//     if (discount.status === 'Active') {
//       await discount.removeFromProducts();
//     }

//     // Update discount
//     const updatedDiscount = await Discount.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     // Apply discount to products if it's active
//     if (updatedDiscount.status === 'Active') {
//       await updatedDiscount.applyToProducts();
//     }

//     // Populate and return the updated discount
//     const populatedDiscount = await Discount.findById(updatedDiscount._id)
//       .populate('category')
//       .populate('products')
//       .populate('appliedProducts.product');

//     return NextResponse.json({
//       success: true,
//       data: populatedDiscount,
//       message: `Discount updated successfully${updatedDiscount.status === 'Active' ? ` and applied to ${updatedDiscount.totalProducts} products` : ''}`
//     });

//   } catch (error) {
//     console.error('PUT Discount Error:', error);
    
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
//         error: 'Failed to update discount',
//         details: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid discount ID' },
//         { status: 400 }
//       );
//     }

//     const discount = await Discount.findById(id);
//     if (!discount) {
//       return NextResponse.json(
//         { success: false, error: 'Discount not found' },
//         { status: 404 }
//       );
//     }

//     // Remove discount from products and restore original prices
//     await discount.manualRemove();

//     // Delete the discount record
//     await Discount.findByIdAndDelete(id);

//     return NextResponse.json({
//       success: true,
//       message: 'Discount deleted successfully and product prices restored'
//     });

//   } catch (error) {
//     console.error('DELETE Discount Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to delete discount' },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discount from '@/Models/Discount';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount ID' },
        { status: 400 }
      );
    }

    const discount = await Discount.findById(id)
      .populate('category')
      .populate('products')
      .populate('appliedProducts.product');

    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: discount
    });

  } catch (error) {
    console.error('❌ GET Discount Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discount' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount ID' },
        { status: 400 }
      );
    }

    const discount = await Discount.findById(id);
    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    console.log(`✏️ Updating discount: ${discount.name}`);

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
    const updateData = { 
      ...body,
      discountValue: parseFloat(body.discountValue),
      updatedAt: new Date()
    };

    // Validate dates
    const startDate = new Date(updateData.startDate);
    const endDate = new Date(updateData.endDate);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate scope-specific fields
    if (updateData.scope === 'category') {
      if (!updateData.category || !mongoose.Types.ObjectId.isValid(updateData.category)) {
        return NextResponse.json(
          { success: false, error: 'Valid category ID is required for category scope' },
          { status: 400 }
        );
      }
    } else {
      updateData.category = undefined;
    }

    if (updateData.scope === 'selected') {
      if (!updateData.products || !Array.isArray(updateData.products) || updateData.products.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one product must be selected for selected scope' },
          { status: 400 }
        );
      }

      const invalidProductIds = updateData.products.filter(
        productId => !mongoose.Types.ObjectId.isValid(productId)
      );
      
      if (invalidProductIds.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid product IDs provided' },
          { status: 400 }
        );
      }
    } else {
      updateData.products = [];
    }

    // Set status based on dates
    const now = new Date();
    if (startDate > now) {
      updateData.status = 'Scheduled';
    } else if (endDate < now) {
      updateData.status = 'Expired';
    } else {
      updateData.status = 'Active';
    }

    // First remove discount from current products
    if (discount.status === 'Active') {
      console.log(`🔄 Removing current discount from products...`);
      await discount.removeFromProducts();
    }

    // Update discount
    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Apply discount to products if it's active
    if (updatedDiscount.status === 'Active') {
      console.log(`🎯 Applying updated discount to products...`);
      await updatedDiscount.applyToProducts();
    }

    // Populate and return the updated discount
    const populatedDiscount = await Discount.findById(updatedDiscount._id)
      .populate('category')
      .populate('products')
      .populate('appliedProducts.product');

    return NextResponse.json({
      success: true,
      data: populatedDiscount,
      message: `Discount updated successfully${updatedDiscount.status === 'Active' ? ` and applied to ${updatedDiscount.totalProducts} products` : ''}`
    });

  } catch (error) {
    console.error('❌ PUT Discount Error:', error);
    
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
        error: 'Failed to update discount',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount ID' },
        { status: 400 }
      );
    }

    const discount = await Discount.findById(id);
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
    await Discount.findByIdAndDelete(id);

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