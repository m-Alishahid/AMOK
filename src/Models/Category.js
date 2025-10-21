import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  // YEH PROPERTIES REMOVE KARDI CATEGORY SE
  // requiresSize: {
  //   type: Boolean,
  //   default: false
  // },
  // requiresColor: {
  //   type: Boolean,
  //   default: false
  // },
  // hasVariants: {
  //   type: Boolean,
  //   default: false
  // },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  metaKeywords: {
    type: String,
    trim: true,
    maxlength: [255, 'Meta keywords cannot exceed 255 characters']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ isFeatured: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);