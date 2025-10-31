import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true,
    maxlength: [100, 'Discount name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  scope: {
    type: String,
    enum: ['all', 'category', 'selected'],
    required: [true, 'Scope is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.scope === 'category';
    }
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return this.scope === 'selected';
    }
  }],
  applicationMethod: {
    type: String,
    enum: ['additive', 'replace', 'best_price'],
    default: 'best_price'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  autoRemove: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired', 'Scheduled'],
    default: 'Scheduled'
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalDiscountAmount: {
    type: Number,
    default: 0
  },
  appliedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    originalPrice: Number,
    originalDiscountedPrice: Number,
    originalDiscountPercentage: Number,
    newDiscountedPrice: Number,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
discountSchema.index({ scope: 1 });
discountSchema.index({ category: 1 });
discountSchema.index({ status: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });
discountSchema.index({ 'appliedProducts.product': 1 });

// Auto-update status based on dates
discountSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.startDate > now) {
    this.status = 'Scheduled';
  } else if (this.endDate < now) {
    this.status = 'Expired';
  } else if (this.status === 'Scheduled' && this.startDate <= now) {
    this.status = 'Active';
  }
  
  this.updatedAt = now;
  next();
});

// Method to apply discount to products
discountSchema.methods.applyToProducts = async function() {
  const Product = mongoose.model('Product');
  
  let filter = {};
  switch (this.scope) {
    case 'all':
      filter = { status: 'Active' };
      break;
    case 'category':
      filter = { category: this.category, status: 'Active' };
      break;
    case 'selected':
      filter = { _id: { $in: this.products }, status: 'Active' };
      break;
  }

  const products = await Product.find(filter);
  this.appliedProducts = [];
  this.totalProducts = products.length;
  
  let totalDiscountAmount = 0;

  for (const product of products) {
    // Store original state BEFORE applying new discount
    const originalState = {
      originalPrice: product.salePrice,
      originalDiscountedPrice: product.discountedPrice || 0,
      originalDiscountPercentage: product.discountPercentage || 0
    };

    const newDiscountedPrice = this.calculateDiscountedPrice(product.salePrice);
    const discountAmount = product.salePrice - newDiscountedPrice;
    
    totalDiscountAmount += discountAmount;

    // Update product with new discount
    await Product.findByIdAndUpdate(product._id, {
      discountedPrice: Math.max(0, newDiscountedPrice),
      discountPercentage: Math.round(((product.salePrice - newDiscountedPrice) / product.salePrice) * 100)
    });

    // Track applied products with original state
    this.appliedProducts.push({
      product: product._id,
      ...originalState,
      newDiscountedPrice: newDiscountedPrice,
      appliedAt: new Date()
    });

    console.log(`✅ Applied discount to ${product.name}: ${product.salePrice} → ${newDiscountedPrice}`);
  }

  this.totalDiscountAmount = totalDiscountAmount;
  await this.save();
  
  console.log(`🎯 Discount "${this.name}" applied to ${products.length} products`);
};

// Method to remove discount and restore original state
discountSchema.methods.removeFromProducts = async function() {
  const Product = mongoose.model('Product');
  
  console.log(`🔄 Removing discount "${this.name}" from ${this.appliedProducts.length} products`);
  
  let restoredCount = 0;
  let skippedCount = 0;

  // ALWAYS restore original state for each product
  for (const appliedProduct of this.appliedProducts) {
    try {
      const product = await Product.findById(appliedProduct.product);
      if (!product) {
        console.log(`❌ Product not found: ${appliedProduct.product}`);
        skippedCount++;
        continue;
      }

      // ALWAYS restore to original state
      const restorePrice = appliedProduct.originalDiscountedPrice > 0 ? 
        appliedProduct.originalDiscountedPrice : 0;
      
      const restoreDiscountPercentage = appliedProduct.originalDiscountedPrice > 0 ? 
        appliedProduct.originalDiscountPercentage : 0;

      await Product.findByIdAndUpdate(appliedProduct.product, {
        $set: {
          discountedPrice: restorePrice,
          discountPercentage: restoreDiscountPercentage
        }
      });

      console.log(`✅ Restored ${product.name} to: ${restorePrice > 0 ? `Discounted (${restorePrice})` : 'Original Price'}`);
      restoredCount++;

    } catch (error) {
      console.error(`❌ Error restoring product ${appliedProduct.product}:`, error);
      skippedCount++;
    }
  }

  console.log(`📊 Restoration complete: ${restoredCount} restored, ${skippedCount} skipped`);

  this.status = 'Expired';
  this.updatedAt = new Date();
  await this.save();
  
  return restoredCount;
};

// Manual remove method (for admin)
discountSchema.methods.manualRemove = async function() {
  const Product = mongoose.model('Product');
  
  console.log(`🔄 Manually removing discount "${this.name}" from ${this.appliedProducts.length} products`);
  
  let restoredCount = 0;

  for (const appliedProduct of this.appliedProducts) {
    try {
      const product = await Product.findById(appliedProduct.product);
      if (!product) continue;

      // ALWAYS restore original prices
      const restorePrice = appliedProduct.originalDiscountedPrice > 0 ? 
        appliedProduct.originalDiscountedPrice : 0;
      
      const restoreDiscountPercentage = appliedProduct.originalDiscountedPrice > 0 ? 
        appliedProduct.originalDiscountPercentage : 0;

      await Product.findByIdAndUpdate(appliedProduct.product, {
        $set: {
          discountedPrice: restorePrice,
          discountPercentage: restoreDiscountPercentage
        }
      });

      console.log(`✅ Manually restored ${product.name} to: ${restorePrice > 0 ? 'previous discounted' : 'original'} price`);
      restoredCount++;

    } catch (error) {
      console.error(`❌ Error manually restoring product:`, error);
    }
  }

  this.status = 'Inactive';
  this.updatedAt = new Date();
  await this.save();

  return restoredCount;
};

// Helper method to calculate discounted price
discountSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (this.discountType === 'percentage') {
    return originalPrice * (1 - this.discountValue / 100);
  } else {
    return Math.max(0, originalPrice - this.discountValue);
  }
};

// ✅ FIXED: Static method to check and update discount statuses
discountSchema.statics.updateDiscountStatuses = async function() {
  const now = new Date();

  console.log('🕒 Checking discount statuses...');

  // Expire discounts that have ended
  const expiredDiscounts = await this.find({
    status: 'Active',
    endDate: { $lt: now },
    autoRemove: true
  });

  console.log(`📋 Found ${expiredDiscounts.length} discounts to expire`);

  let totalExpired = 0;
  for (const discount of expiredDiscounts) {
    try {
      console.log(`⏰ Expiring discount: ${discount.name}`);
      
      // ✅ YEH LINE IMPORTANT HAI - removeFromProducts call karo
      const restoredCount = await discount.removeFromProducts();
      
      console.log(`✅ Successfully expired discount: ${discount.name} (${restoredCount} products restored)`);
      totalExpired++;
    } catch (error) {
      console.error(`❌ Error expiring discount ${discount.name}:`, error);
    }
  }

  // Activate scheduled discounts
  const scheduledDiscounts = await Discount.find({
    status: 'Scheduled',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  console.log(`📋 Found ${scheduledDiscounts.length} discounts to activate`);

  let totalActivated = 0;
  for (const discount of scheduledDiscounts) {
    try {
      console.log(`🎯 Activating discount: ${discount.name}`);
      discount.status = 'Active';
      await discount.save();
      await discount.applyToProducts();
      totalActivated++;
      console.log(`✅ Successfully activated discount: ${discount.name}`);
    } catch (error) {
      console.error(`❌ Error activating discount ${discount.name}:`, error);
    }
  }

  return {
    expired: totalExpired,
    activated: totalActivated
  };
};

// Method to check if this discount is currently applied to a product
discountSchema.methods.isAppliedToProduct = function(productId) {
  return this.appliedProducts.some(ap => 
    ap.product.toString() === productId.toString() && 
    ap.newDiscountedPrice > 0
  );
};

export default mongoose.models.Discount || mongoose.model('Discount', discountSchema);