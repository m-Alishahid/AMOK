import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    size: {
      type: String,
      default: 'Standard'
    },
    color: {
      type: String,
      default: 'Standard'
    },
    fabric: {
      type: String,
      default: ''
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  productSnapshot: {
    name: String,
    thumbnail: String,
    sku: String
  },
  // ✅ Stock tracking for returns
  originalStock: {
    type: Number,
    default: 0
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String,
    trim: true
  },
  returnedAt: {
    type: Date
  }
});

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'netbanking', 'cod', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentGateway: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  upiId: {
    type: String,
    trim: true
  },
  cardLast4: {
    type: String,
    trim: true
  },
  // ✅ COD Specific Fields
  codDetails: {
    collectedAmount: {
      type: Number,
      default: 0
    },
    collectedAt: {
      type: Date
    },
    collectedBy: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }
});

const shippingSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['standard', 'express', 'next_day', 'store_pickup'],
    default: 'standard'
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
});

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing Breakdown
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  
  // Addresses
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: {
    type: addressSchema,
    required: true
  },
  
  // Payment Information
  payment: {
    type: paymentSchema,
    required: true
  },
  
  // Shipping Information
  shipping: {
    type: shippingSchema,
    required: true
  },
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'failed',
      'returned',
      'partially_returned'
    ],
    default: 'pending'
  },
  
  // Order Timeline
  timeline: {
    orderedAt: {
      type: Date,
      default: Date.now
    },
    confirmedAt: Date,
    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    returnedAt: Date
  },
  
  // Cancellation & Refunds
  cancellation: {
    reason: {
      type: String,
      trim: true
    },
    requestedBy: {
      type: String,
      enum: ['customer', 'admin', 'system']
    },
    notes: {
      type: String,
      trim: true
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed'],
      default: 'pending'
    }
  },
  
  // Returns
  returns: [{
    itemId: mongoose.Schema.Types.ObjectId,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    reason: String,
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'completed'],
      default: 'requested'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    refundAmount: Number
  }],
  
  // Admin Notes
  adminNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Customer Notes
  customerNotes: {
    type: String,
    trim: true
  },
  
  // Analytics
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'admin'],
    default: 'website'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  
  // Marketing
  couponCode: {
    type: String,
    trim: true
  },
  affiliateId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// ✅ PRE-SAVE HOOK - Order Number Generation & Stock Management
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate order number
    const date = new Date();
    const dateString = date.getFullYear().toString() + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0');
    
    const random = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `ORD${dateString}${random}`;
    
    // ✅ Store original stock for each item
    for (let item of this.items) {
      const Product = mongoose.model('Product');
      const product = await Product.findById(item.product);
      if (product) {
        item.originalStock = product.getVariantStock(
          item.variant.size, 
          item.variant.color
        );
      }
    }
  }
  
  // Auto-calculate pricing if items are modified
  if (this.isModified('items') || this.isNew) {
    this.calculatePricing();
  }
  
  // Update timeline based on status changes
  if (this.isModified('status')) {
    await this.updateTimeline();
  }
  
  next();
});

// ✅ METHODS

// Calculate pricing
orderSchema.methods.calculatePricing = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  this.pricing = {
    subtotal: subtotal,
    shipping: this.shipping.cost || 0,
    tax: this.pricing?.tax || 0,
    discount: this.pricing?.discount || 0,
    grandTotal: Math.max(0, subtotal + (this.shipping.cost || 0) + (this.pricing?.tax || 0) - (this.pricing?.discount || 0)),
    currency: 'PKR'
  };
};

// Update timeline based on status
orderSchema.methods.updateTimeline = async function() {
  const now = new Date();
  
  if (!this.timeline) {
    this.timeline = {};
  }
  
  const Product = mongoose.model('Product');
  
  switch (this.status) {
    case 'confirmed':
      this.timeline.confirmedAt = now;
      break;
      
    case 'processing':
      this.timeline.processedAt = now;
      break;
      
    case 'shipped':
      this.timeline.shippedAt = now;
      this.shipping.shippedAt = now;
      break;
      
    case 'delivered':
      this.timeline.deliveredAt = now;
      this.shipping.deliveredAt = now;
      
      // ✅ Update product sales count when delivered
      for (let item of this.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { sales: item.quantity } }
        );
      }
      break;
      
    case 'cancelled':
      this.timeline.cancelledAt = now;
      // ✅ Restore stock when order is cancelled
      await this.restoreStock();
      break;
      
    case 'returned':
      this.timeline.returnedAt = now;
      // ✅ Restore stock for returned items
      await this.restoreStock();
      break;
  }
};

// ✅ RESTORE STOCK METHOD (For cancellations and returns)
orderSchema.methods.restoreStock = async function() {
  const Product = mongoose.model('Product');
  
  for (let item of this.items) {
    if (!item.isReturned) {
      const product = await Product.findById(item.product);
      if (product) {
        // Restore stock for the variant
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { sales: -item.quantity } }
        );
        
        // Also update variant stock if needed
        const result = await Product.updateOne(
          { 
            _id: item.product,
            'variants.size': item.variant.size,
            'variants.colors.color': item.variant.color
          },
          { 
            $inc: { 
              'variants.$[v].colors.$[c].stock': item.quantity,
              totalStock: item.quantity
            } 
          },
          {
            arrayFilters: [
              { 'v.size': item.variant.size },
              { 'c.color': item.variant.color }
            ]
          }
        );
        
        // If variant update fails, update total stock
        if (result.nModified === 0) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { totalStock: item.quantity } }
          );
        }
        
        item.isReturned = true;
        item.returnedAt = new Date();
      }
    }
  }
};

// ✅ PROCESS RETURN REQUEST
orderSchema.methods.processReturn = async function(itemId, reason, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in order');
  }
  
  if (quantity > item.quantity) {
    throw new Error('Return quantity cannot exceed ordered quantity');
  }
  
  // Add to returns array
  this.returns.push({
    itemId: itemId,
    product: item.product,
    quantity: quantity,
    reason: reason,
    status: 'requested'
  });
  
  // Mark item as returned if full quantity is returned
  if (quantity === item.quantity) {
    item.isReturned = true;
    item.returnReason = reason;
    item.returnedAt = new Date();
  }
  
  // Update order status if all items are returned
  const allReturned = this.items.every(item => item.isReturned);
  if (allReturned) {
    this.status = 'returned';
  } else if (this.returns.length > 0) {
    this.status = 'partially_returned';
  }
  
  await this.save();
};

// ✅ APPROVE RETURN
orderSchema.methods.approveReturn = async function(returnId, refundAmount = null) {
  const returnItem = this.returns.id(returnId);
  if (!returnItem) {
    throw new Error('Return request not found');
  }
  
  returnItem.status = 'approved';
  returnItem.processedAt = new Date();
  
  if (refundAmount) {
    returnItem.refundAmount = refundAmount;
  }
  
  // Restore stock for returned item
  const Product = mongoose.model('Product');
  const product = await Product.findById(returnItem.product);
  if (product) {
    await Product.findByIdAndUpdate(
      returnItem.product,
      { $inc: { sales: -returnItem.quantity } }
    );
  }
  
  await this.save();
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  return cancellableStatuses.includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (this.status !== 'delivered') return false;
  
  const deliveredAt = this.timeline.deliveredAt || this.shipping.deliveredAt;
  if (!deliveredAt) return false;
  
  // Allow returns within 7 days of delivery
  const returnPeriod = 7 * 24 * 60 * 60 * 1000;
  return (Date.now() - deliveredAt.getTime()) <= returnPeriod;
};

// Get order status timeline
orderSchema.methods.getStatusTimeline = function() {
  const timeline = [];
  
  if (this.timeline.orderedAt) {
    timeline.push({ status: 'ordered', date: this.timeline.orderedAt });
  }
  if (this.timeline.confirmedAt) {
    timeline.push({ status: 'confirmed', date: this.timeline.confirmedAt });
  }
  if (this.timeline.processedAt) {
    timeline.push({ status: 'processing', date: this.timeline.processedAt });
  }
  if (this.timeline.shippedAt) {
    timeline.push({ status: 'shipped', date: this.timeline.shippedAt });
  }
  if (this.timeline.deliveredAt) {
    timeline.push({ status: 'delivered', date: this.timeline.deliveredAt });
  }
  if (this.timeline.cancelledAt) {
    timeline.push({ status: 'cancelled', date: this.timeline.cancelledAt });
  }
  if (this.timeline.returnedAt) {
    timeline.push({ status: 'returned', date: this.timeline.returnedAt });
  }
  
  return timeline;
};

// ✅ STATIC METHODS

// Get orders by customer
orderSchema.statics.getOrdersByCustomer = function(customerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'name email')
    .populate('items.product', 'name thumbnail');
};

// Get orders by status
orderSchema.statics.getOrdersByStatus = function(status, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ status })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'name email')
    .populate('items.product', 'name thumbnail');
};

// Get recent orders
orderSchema.statics.getRecentOrders = function(limit = 10) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'name email')
    .populate('items.product', 'name thumbnail');
};

// Get sales analytics
orderSchema.statics.getSalesAnalytics = async function(startDate, endDate) {
  const matchStage = {
    status: { $in: ['delivered', 'shipped', 'processing'] },
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.grandTotal' },
        averageOrderValue: { $avg: '$pricing.grandTotal' }
      }
    }
  ]);
};

// Get daily orders count
orderSchema.statics.getDailyOrdersCount = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
};

// ✅ VIRTUAL FIELDS

// Order status text
orderSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'returned': 'Returned',
    'partially_returned': 'Partially Returned'
  };
  
  return statusMap[this.status] || this.status;
});

// Is order completed
orderSchema.virtual('isCompleted').get(function() {
  return this.status === 'delivered';
});

// Is order active
orderSchema.virtual('isActive').get(function() {
  const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped'];
  return activeStatuses.includes(this.status);
});

// Total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Is COD order
orderSchema.virtual('isCOD').get(function() {
  return this.payment.method === 'cod';
});

// ✅ INDEXES for Performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.pincode': 1 });
orderSchema.index({ 'payment.transactionId': 1 });
orderSchema.index({ 'payment.method': 1 }); // For COD queries

// ✅ SET VIRTUALS TO JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);