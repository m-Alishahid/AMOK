import mongoose from 'mongoose';

const colorStockSchema = new mongoose.Schema({
  color: {
    type: String,
    required: false,
    trim: true
  },
  stock: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  }
});

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    trim: true
  },
  fabric: {
    type: String,
    trim: true
  },
  colors: [colorStockSchema]
});

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  
  // Pricing
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Sale price cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= this.costPrice;
      },
      message: 'Sale price should be greater than or equal to cost price'
    }
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    validate: {
      validator: function(value) {
        if (value > 0) {
          return value <= this.salePrice && value >= this.costPrice;
        }
        return true;
      },
      message: 'Discounted price should be between cost price and sale price'
    }
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%'],
    default: 0
  },
  
  // Profit Calculation
  profit: {
    type: Number,
    default: 0
  },
  profitPercentage: {
    type: Number,
    default: 0
  },
  
  // Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Product Properties
  requiresSize: {
    type: Boolean,
    default: false
  },
  requiresColor: {
    type: Boolean,
    default: false
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  
  // Images
  images: [{
    type: String,
    required: true
  }],
  thumbnail: {
    type: String,
    required: true
  },
  
  // Stock & Variants
  totalStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  variants: [variantSchema],
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  
  // SEO
  seoTitle: {
    type: String,
    trim: true
  },
  seoDescription: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ PERFECT PRE-SAVE HOOK - Single aur optimized
productSchema.pre('save', function(next) {
  const sellingPrice = this.discountedPrice > 0 ? this.discountedPrice : this.salePrice;
  
  // Profit calculation
  this.profit = sellingPrice - this.costPrice;
  
  // Profit percentage calculation
  if (this.costPrice > 0) {
    this.profitPercentage = Math.round((this.profit / this.costPrice) * 100);
  } else {
    this.profitPercentage = 0;
  }
  
  // ✅ PERFECT DISCOUNT CALCULATION
  if (this.discountedPrice > 0 && this.discountedPrice < this.salePrice && this.salePrice > 0) {
    const discountAmount = this.salePrice - this.discountedPrice;
    this.discountPercentage = Math.round((discountAmount / this.salePrice) * 100);
    
    // Ensure discount percentage is valid
    if (this.discountPercentage <= 0 || this.discountPercentage > 100) {
      this.discountPercentage = 0;
      this.discountedPrice = null;
    }
  } else {
    this.discountPercentage = 0;
    // If discounted price is invalid, reset it
    if (this.discountedPrice && (this.discountedPrice >= this.salePrice || this.discountedPrice < this.costPrice)) {
      this.discountedPrice = null;
    }
  }
  
  // ✅ TOTAL STOCK CALCULATION FROM VARIANTS
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((total, variant) => {
      const variantStock = variant.colors.reduce((colorSum, color) => {
        return colorSum + (parseInt(color.stock) || 0);
      }, 0);
      return total + variantStock;
    }, 0);
    
    // Set requiresSize and requiresColor based on variants
    this.requiresSize = this.variants.some(v => v.size && v.size.trim() !== '');
    this.requiresColor = this.variants.some(v => v.colors && v.colors.length > 0);
    this.hasVariants = this.requiresSize || this.requiresColor;
  }
  
  this.updatedAt = Date.now();
  next();
});

// ✅ PRE-UPDATE HOOK for findOneAndUpdate operations
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.$set) {
    const set = update.$set;
    
    // Recalculate if pricing fields are being updated
    if (set.costPrice !== undefined || set.salePrice !== undefined || set.discountedPrice !== undefined) {
      const sellingPrice = (set.discountedPrice > 0 ? set.discountedPrice : set.salePrice) || this._update.$set.salePrice;
      const costPrice = set.costPrice || this._update.$set.costPrice;
      
      if (sellingPrice && costPrice) {
        update.$set.profit = sellingPrice - costPrice;
        if (costPrice > 0) {
          update.$set.profitPercentage = Math.round(((sellingPrice - costPrice) / costPrice) * 100);
        }
      }
      
      // Recalculate discount percentage
      if (set.discountedPrice !== undefined && set.salePrice !== undefined) {
        if (set.discountedPrice > 0 && set.discountedPrice < set.salePrice) {
          const discountAmount = set.salePrice - set.discountedPrice;
          update.$set.discountPercentage = Math.round((discountAmount / set.salePrice) * 100);
        } else {
          update.$set.discountPercentage = 0;
          if (set.discountedPrice >= set.salePrice) {
            update.$set.discountedPrice = null;
          }
        }
      }
    }
    
    // Recalculate total stock if variants are updated
    if (set.variants !== undefined) {
      const variants = set.variants;
      if (variants && variants.length > 0) {
        const totalStock = variants.reduce((total, variant) => {
          const variantStock = variant.colors.reduce((colorSum, color) => {
            return colorSum + (parseInt(color.stock) || 0);
          }, 0);
          return total + variantStock;
        }, 0);
        update.$set.totalStock = totalStock;
        
        // Update variant flags
        update.$set.requiresSize = variants.some(v => v.size && v.size.trim() !== '');
        update.$set.requiresColor = variants.some(v => v.colors && v.colors.length > 0);
        update.$set.hasVariants = update.$set.requiresSize || update.$set.requiresColor;
      }
    }
  }
  
  update.$set = { ...update.$set, updatedAt: new Date() };
  next();
});

// ✅ VIRTUAL FIELDS
productSchema.virtual('discountAmount').get(function() {
  if (this.discountedPrice > 0 && this.discountedPrice < this.salePrice) {
    return this.salePrice - this.discountedPrice;
  }
  return 0;
});

productSchema.virtual('finalPrice').get(function() {
  return this.discountedPrice > 0 ? this.discountedPrice : this.salePrice;
});

productSchema.virtual('isOnSale').get(function() {
  return this.discountedPrice > 0 && this.discountedPrice < this.salePrice;
});

// ✅ METHODS
productSchema.methods.getStockForVariant = function(size, color) {
  if (!this.variants || this.variants.length === 0) {
    return this.totalStock;
  }
  
  const variant = this.variants.find(v => v.size === size);
  if (variant && variant.colors) {
    const colorVariant = variant.colors.find(c => c.color === color);
    return colorVariant ? colorVariant.stock : 0;
  }
  
  return 0;
};

productSchema.methods.getAvailableSizes = function() {
  if (!this.variants || this.variants.length === 0) {
    return [];
  }
  
  return [...new Set(this.variants.map(v => v.size))].filter(Boolean);
};

productSchema.methods.getAvailableColors = function(size = null) {
  if (!this.variants || this.variants.length === 0) {
    return [];
  }
  
  let targetVariants = this.variants;
  if (size) {
    targetVariants = this.variants.filter(v => v.size === size);
  }
  
  const allColors = targetVariants.flatMap(v => v.colors || []);
  const uniqueColors = [...new Map(allColors.map(color => [color.color, color])).values()];
  
  return uniqueColors;
};

// ✅ STATIC METHODS
productSchema.statics.getProductsByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'Active' }).populate('category');
};

productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({ status: 'Active' })
    .sort({ sales: -1, views: -1 })
    .limit(limit)
    .populate('category');
};

productSchema.statics.getDiscountedProducts = function(limit = 10) {
  return this.find({ 
    status: 'Active',
    discountedPrice: { $gt: 0 },
    salePrice: { $gt: 0 },
    $expr: { $lt: ['$discountedPrice', '$salePrice'] }
  })
  .sort({ discountPercentage: -1 })
  .limit(limit)
  .populate('category');
};

// ✅ INDEXES for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ discountPercentage: -1 });
productSchema.index({ 'variants.colors.stock': 1 });
productSchema.index({ name: 'text', description: 'text' });

// ✅ SET VIRTUALS TO JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);