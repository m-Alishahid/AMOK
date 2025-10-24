// import mongoose from 'mongoose';

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Category name is required'],
//     trim: true,
//     maxlength: [100, 'Category name cannot exceed 100 characters'],
//     unique: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//     maxlength: [500, 'Description cannot exceed 500 characters']
//   },
//   image: {
//     type: String,
//     required: [true, 'Category image is required']
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'Inactive'],
//     default: 'Active'
//   }
// }, {
//   timestamps: true
// });

// // Index for better performance
// categorySchema.index({ name: 1 });
// categorySchema.index({ status: 1 });
// categorySchema.index({ isFeatured: 1 });

// export default mongoose.models.Category || mongoose.model('Category', categorySchema);

import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
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

// ✅ Auto-generate slug from name before save
categorySchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
