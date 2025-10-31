// // Models/Invoice.js - UPDATED WITH STOCK MANAGEMENT
// import mongoose from 'mongoose';

// const invoiceItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   productName: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   unitPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   totalPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   size: {
//     type: String,
//     default: ''
//   },
//   color: {
//     type: String,
//     default: ''
//   }
// });

// const invoiceSchema = new mongoose.Schema({
//   invoiceNumber: {
//     type: String,
//     unique: true
//   },
//   type: {
//     type: String,
//     enum: ['stock_allocation', 'vendor_sale', 'stock_return', 'payment'],
//     required: true
//   },
//   vendor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendor',
//     required: true
//   },
//   items: [invoiceItemSchema],
//   subtotal: {
//     type: Number,
//     required: true
//   },
//   taxAmount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['draft', 'pending_approval', 'approved', 'paid', 'overdue', 'cancelled', 'rejected'],
//     default: 'draft'
//   },
//   dueDate: {
//     type: Date,
//     default: function() {
//       return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
//     }
//   },
//   paymentDate: Date,
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   approvedAt: Date,
//   rejectionReason: String,
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   notes: String,
//   terms: String
// }, {
//   timestamps: true
// });

// // ✅ UPDATE VENDOR STOCK METHOD
// invoiceSchema.methods.updateVendorStock = async function() {
//   try {
//     const Vendor = mongoose.model('Vendor');
//     const vendor = await Vendor.findById(this.vendor);
    
//     if (!vendor) {
//       throw new Error('Vendor not found');
//     }

//     for (const item of this.items) {
//       const vendorProduct = vendor.products.find(p => 
//         p.product.toString() === item.product.toString() &&
//         p.size === item.size &&
//         p.color === item.color
//       );

//       if (vendorProduct) {
//         if (this.type === 'vendor_sale') {
//           // For sales, reduce current stock and increase sold stock
//           if (vendorProduct.currentStock < item.quantity) {
//             throw new Error(`Insufficient stock for ${item.productName}. Available: ${vendorProduct.currentStock}, Requested: ${item.quantity}`);
//           }
          
//           vendorProduct.currentStock -= item.quantity;
//           vendorProduct.soldStock += item.quantity;
          
//           // Update total profit
//           vendorProduct.totalProfit = vendorProduct.profitPerPiece * vendorProduct.soldStock;
//         } else if (this.type === 'stock_allocation') {
//           // For allocation, increase current stock
//           vendorProduct.currentStock += item.quantity;
//         } else if (this.type === 'stock_return') {
//           // For returns, increase current stock and decrease sold stock
//           vendorProduct.currentStock += item.quantity;
//           vendorProduct.soldStock = Math.max(0, vendorProduct.soldStock - item.quantity);
//         }

//         await vendor.save();
//       }
//     }

//     // Update vendor's total profit
//     await vendor.updateTotalProfit();
    
//     return true;
//   } catch (error) {
//     console.error('Stock update error:', error);
//     throw error;
//   }
// };

// // ✅ APPROVE INVOICE METHOD
// invoiceSchema.methods.approveInvoice = async function(approvedBy) {
//   try {
//     if (this.status !== 'Pending Approval') {
//       throw new Error('Invoice is not pending approval');
//     }

//     // Update vendor stock
//     await this.updateVendorStock();

//     // Update invoice status
//     this.status = 'Approved';
//     this.approvedBy = approvedBy;
//     this.approvedAt = new Date();
    
//     await this.save();
    
//     return this;
//   } catch (error) {
//     console.error('Invoice approval error:', error);
//     throw error;
//   }
// };

// // ✅ PERFECT FIXED: Manual invoice number generation
// invoiceSchema.methods.generateInvoiceNumber = async function() {
//   try {
//     const lastInvoice = await mongoose.model('Invoice')
//       .findOne({}, {}, { sort: { 'createdAt': -1 } });
    
//     let nextNumber = 1;
//     if (lastInvoice && lastInvoice.invoiceNumber) {
//       const matches = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
//       if (matches && matches[1]) {
//         nextNumber = parseInt(matches[1]) + 1;
//       }
//     }
    
//     return `INV-${String(nextNumber).padStart(5, '0')}`;
//   } catch (error) {
//     console.error('Error generating invoice number:', error);
//     return `INV-${Date.now()}`;
//   }
// };

// // ✅ FIXED: Pre-save hook that actually works
// invoiceSchema.pre('save', async function(next) {
//   try {
//     // Only generate invoice number if it doesn't exist
//     if (!this.invoiceNumber) {
//       this.invoiceNumber = await this.generateInvoiceNumber();
//     }
    
//     // If vendor creates invoice, set status to Pending Approval
//     if (this.isNew && this.createdBy) {
//       const User = mongoose.model('User');
//       const creator = await User.findById(this.createdBy);
      
//       if (creator && (creator.isVendor || creator.role === 'vendor')) {
//         this.status = 'Pending Approval';
//       }
//     }
    
//     next();
//   } catch (error) {
//     console.error('Error in pre-save hook:', error);
//     if (!this.invoiceNumber) {
//       this.invoiceNumber = `INV-EMG-${Date.now()}`;
//     }
//     next();
//   }
// });

// // ✅ Add index for better performance
// invoiceSchema.index({ invoiceNumber: 1 });
// invoiceSchema.index({ vendor: 1 });
// invoiceSchema.index({ status: 1 });
// invoiceSchema.index({ createdAt: -1 });

// export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);



import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
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
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  size: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['stock_allocation', 'vendor_sale', 'stock_return', 'payment'],
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'paid', 'overdue', 'cancelled', 'rejected'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  paymentDate: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  terms: String,
  
  // ✅ NEW: Track stock update status
  stockUpdated: {
    type: Boolean,
    default: false
  },
  stockUpdateError: String
}, {
  timestamps: true
});

// ✅ PERFECT STOCK UPDATE METHOD - Vendor aur Product dono update karega
invoiceSchema.methods.updateVendorAndProductStock = async function() {
  try {
    console.log('🔄 Starting stock update for invoice:', this.invoiceNumber);
    
    const Vendor = mongoose.model('Vendor');
    const Product = mongoose.model('Product');
    
    const vendor = await Vendor.findById(this.vendor);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // ✅ Process each item in the invoice
    for (const item of this.items) {
      console.log('📦 Processing item:', {
        product: item.product,
        productName: item.productName,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });

      // ✅ 1. UPDATE VENDOR STOCK
      let vendorProduct = vendor.products.find(p => 
        p.product.toString() === item.product.toString() &&
        p.size === (item.size || '') &&
        p.color === (item.color || '')
      );

      if (!vendorProduct) {
        console.log('⚠️ Vendor product not found, creating new allocation...');
        
        // Create new vendor product allocation
        vendorProduct = {
          product: item.product,
          allocatedStock: 0,
          currentStock: 0,
          soldStock: 0,
          size: item.size || '',
          color: item.color || '',
          costPrice: 0,
          salePrice: item.unitPrice,
          vendorPrice: item.unitPrice,
          profitPerPiece: 0,
          totalProfit: 0,
          status: 'Active'
        };
        
        vendor.products.push(vendorProduct);
        vendorProduct = vendor.products[vendor.products.length - 1];
      }

      console.log('📊 Vendor product before update:', {
        currentStock: vendorProduct.currentStock,
        soldStock: vendorProduct.soldStock,
        allocatedStock: vendorProduct.allocatedStock
      });

      // ✅ Update vendor stock based on invoice type
      if (this.type === 'vendor_sale') {
        // For sales: Reduce current stock, increase sold stock
        if (vendorProduct.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}. Available: ${vendorProduct.currentStock}, Requested: ${item.quantity}`);
        }
        
        vendorProduct.currentStock -= item.quantity;
        vendorProduct.soldStock += item.quantity;
        
        console.log('✅ Vendor stock updated for sale:', {
          newCurrentStock: vendorProduct.currentStock,
          newSoldStock: vendorProduct.soldStock
        });

      } else if (this.type === 'stock_allocation') {
        // For allocation: Increase both allocated and current stock
        vendorProduct.allocatedStock += item.quantity;
        vendorProduct.currentStock += item.quantity;
        
        console.log('✅ Vendor stock updated for allocation:', {
          newAllocatedStock: vendorProduct.allocatedStock,
          newCurrentStock: vendorProduct.currentStock
        });

      } else if (this.type === 'stock_return') {
        // For returns: Increase current stock, decrease sold stock
        vendorProduct.currentStock += item.quantity;
        vendorProduct.soldStock = Math.max(0, vendorProduct.soldStock - item.quantity);
        
        console.log('✅ Vendor stock updated for return:', {
          newCurrentStock: vendorProduct.currentStock,
          newSoldStock: vendorProduct.soldStock
        });
      }

      // ✅ Update vendor product profit
      if (vendorProduct.profitPerPiece) {
        vendorProduct.totalProfit = vendorProduct.profitPerPiece * vendorProduct.soldStock;
      }

      // ✅ 2. UPDATE PRODUCT VARIANT STOCK (Only for vendor_sale)
      if (this.type === 'vendor_sale') {
        const product = await Product.findById(item.product);
        if (product) {
          console.log('🎯 Updating product variant stock:', {
            product: product.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity
          });

          // Update product variant stock
          const stockUpdated = product.updateVariantStock(
            item.size || 'Standard', 
            item.color || 'Standard', 
            item.quantity
          );

          if (stockUpdated) {
            await product.save();
            console.log('✅ Product variant stock updated successfully');
          } else {
            console.log('⚠️ Product variant stock update failed - variant not found');
          }
        } else {
          console.log('⚠️ Product not found for stock update:', item.product);
        }
      }
    }

    // ✅ Save vendor changes
    await vendor.save();
    console.log('✅ Vendor stock updated successfully');

    // ✅ Mark invoice as stock updated
    this.stockUpdated = true;
    this.stockUpdateError = null;
    await this.save();

    return true;

  } catch (error) {
    console.error('❌ Stock update error:', error);
    this.stockUpdateError = error.message;
    await this.save();
    throw error;
  }
};

// ✅ APPROVE INVOICE METHOD - Stock update karega
invoiceSchema.methods.approveInvoice = async function(approvedBy) {
  try {
    if (this.status !== 'pending_approval') {
      throw new Error('Invoice is not pending approval');
    }

    console.log('✅ Approving invoice and updating stock...');

    // ✅ Update vendor and product stock
    await this.updateVendorAndProductStock();

    // ✅ Update invoice status
    this.status = 'approved';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    
    await this.save();
    
    console.log('✅ Invoice approved and stock updated successfully');
    return this;

  } catch (error) {
    console.error('❌ Invoice approval error:', error);
    throw error;
  }
};

// ✅ MARK AS PAID METHOD - Only payment status change
invoiceSchema.methods.markAsPaid = async function() {
  try {
    if (this.status !== 'approved') {
      throw new Error('Only approved invoices can be marked as paid');
    }

    console.log('💰 Marking invoice as paid:', this.invoiceNumber);

    // ✅ Only update payment status, no stock changes
    this.status = 'paid';
    this.paymentDate = new Date();
    
    await this.save();
    
    console.log('✅ Invoice marked as paid successfully');
    return this;

  } catch (error) {
    console.error('❌ Mark as paid error:', error);
    throw error;
  }
};

// ✅ MANUAL STOCK UPDATE METHOD (if needed)
invoiceSchema.methods.manualStockUpdate = async function() {
  try {
    console.log('🔧 Manual stock update triggered for:', this.invoiceNumber);
    
    if (this.status !== 'approved' && this.status !== 'paid') {
      throw new Error('Only approved or paid invoices can update stock');
    }

    await this.updateVendorAndProductStock();
    return true;

  } catch (error) {
    console.error('❌ Manual stock update error:', error);
    throw error;
  }
};

// ✅ PERFECT FIXED: Manual invoice number generation
invoiceSchema.methods.generateInvoiceNumber = async function() {
  try {
    const lastInvoice = await mongoose.model('Invoice')
      .findOne({}, {}, { sort: { 'createdAt': -1 } });
    
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const matches = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (matches && matches[1]) {
        nextNumber = parseInt(matches[1]) + 1;
      }
    }
    
    return `INV-${String(nextNumber).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return `INV-${Date.now()}`;
  }
};

// ✅ FIXED: Pre-save hook
invoiceSchema.pre('save', async function(next) {
  try {
    // Only generate invoice number if it doesn't exist
    if (!this.invoiceNumber) {
      this.invoiceNumber = await this.generateInvoiceNumber();
    }
    
    // If vendor creates invoice, set status to pending_approval
    if (this.isNew && this.createdBy) {
      const User = mongoose.model('User');
      const creator = await User.findById(this.createdBy);
      
      if (creator && (creator.isVendor || creator.role === 'vendor')) {
        this.status = 'pending_approval';
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    if (!this.invoiceNumber) {
      this.invoiceNumber = `INV-EMG-${Date.now()}`;
    }
    next();
  }
});

// ✅ Add index for better performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ vendor: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ stockUpdated: 1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);