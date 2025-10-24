// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   // Personal Information
//   firstName: {
//     type: String,
//     required: [true, 'First name is required'],
//     trim: true,
//     maxlength: [50, 'First name cannot exceed 50 characters']
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Last name is required'],
//     trim: true,
//     maxlength: [50, 'Last name cannot exceed 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters']
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   profileImage: {
//     type: String,
//     default: ''
//   },
  
//   // Role & Permissions
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     required: true
//   },
  
//   // Account Status
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   lastLogin: {
//     type: Date
//   },
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: {
//     type: Date
//   },
  
//   // Additional Information
//   department: {
//     type: String,
//     trim: true
//   },
//   position: {
//     type: String,
//     trim: true
//   },
//   employeeId: {
//     type: String,
//     trim: true,
//     unique: true,
//     sparse: true
//   },
  
//   // Security
//   passwordChangedAt: Date,
//   passwordResetToken: String,
//   passwordResetExpires: Date,
//   emailVerificationToken: String,
  
//   // Audit
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Virtual for full name
// userSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Index for better performance
// userSchema.index({ role: 1 });
// userSchema.index({ isActive: 1 });

// // Password hashing middleware
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Update passwordChangedAt when password is modified
// userSchema.pre('save', function(next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// // Method to check password
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// // Method to check if password was changed after token was issued
// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// // Method to check if account is locked
// userSchema.methods.isLocked = function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// };

// // Method to increment login attempts
// userSchema.methods.incrementLoginAttempts = async function() {
//   // If we have a previous lock that has expired, restart at 1
//   if (this.lockUntil && this.lockUntil < Date.now()) {
//     return this.updateOne({
//       $set: { loginAttempts: 1 },
//       $unset: { lockUntil: 1 }
//     });
//   }
  
//   // Otherwise increment
//   const updates = { $inc: { loginAttempts: 1 } };
  
//   // Lock the account if we've reached max attempts and it's not locked already
//   if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
//     updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
//   }
  
//   return this.updateOne(updates);
// };

// export default mongoose.models.User || mongoose.model('User', userSchema);









import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // 🧍 Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },

  // 👥 Role System
  roleType: {
    type: String,
    enum: ['customer', 'staff'],
    default: 'customer'
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null // only used if roleType = 'staff'
  },

  // ⚙️ Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },

  // 🏢 Employment Info (only for staff users)
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  employeeId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },

  // 🔐 Security Fields
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },

  // 🧾 Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});


// 🔹 Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});


// 🔹 Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ roleType: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });


// 🔒 Password Hashing Middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// 🔄 Update passwordChangedAt timestamp when password changes
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // 1 sec offset
  next();
});


// 🧠 Compare entered password with hashed password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


// ⏱️ Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


// 🔐 Account lock management
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};


// 🔁 Increment login attempts logic
userSchema.methods.incrementLoginAttempts = async function() {
  // If lock expired, reset counter
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Otherwise, increment attempt
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if exceeded max attempts (5)
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};


// 🔓 Reset account lock
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};


// 🧩 Check if user is staff or customer easily
userSchema.methods.isCustomer = function() {
  return this.roleType === 'customer';
};

userSchema.methods.isStaff = function() {
  return this.roleType === 'staff';
};


// 🧾 Audit log helper
userSchema.methods.setAudit = function(userId, type = 'create') {
  if (type === 'create') {
    this.createdBy = userId;
  } else {
    this.updatedBy = userId;
  }
};


// ✅ Export model
export default mongoose.models.User || mongoose.model('User', userSchema);
