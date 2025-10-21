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
    min: 0
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
    min: [0, 'Sale price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%'],
    default: 0
  },
  
  // Profit Calculation (Virtual)
  profit: {
    type: Number,
    default: 0
  },
  
  // Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Product Properties - YEH NAYA SECTION ADD KIYA
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
    type: String, // URLs of uploaded images
    required: true
  }],
  thumbnail: {
    type: String, // URL of thumbnail image
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

// Calculate profit before saving
productSchema.pre('save', function(next) {
  const sellingPrice = this.discountedPrice > 0 ? this.discountedPrice : this.salePrice;
  this.profit = sellingPrice - this.costPrice;
  
  // Calculate discount percentage if discounted price is set
  if (this.discountedPrice > 0 && this.salePrice > 0) {
    this.discountPercentage = Math.round(((this.salePrice - this.discountedPrice) / this.salePrice) * 100);
  }
  
  this.updatedAt = Date.now();
  next();
});

// Index for better performance
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.discountedPrice > 0) {
    return this.salePrice - this.discountedPrice;
  }
  return 0;
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);