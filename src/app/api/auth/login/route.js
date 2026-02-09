// // import { NextResponse } from 'next/server';
// // import connectDB from '../../../../lib/mongodb';
// // import User from '../../../../Models/User';
// // import { generateToken, getCookieOptions } from '../../../../lib/jwt';

// // export async function POST(request) {
// //   try {
// //     await connectDB();

// //     const body = await request.json();
// //     const { email, password } = body;

// //     if (!email || !password) {
// //       return NextResponse.json(
// //         { success: false, error: 'Please provide email and password' },
// //         { status: 400 }
// //       );
// //     }

// //     // Find user and populate role (if it’s a reference)
// //     const user = await User.findOne({ email }).populate('role');

// //     if (!user || !(await user.correctPassword(password, user.password))) {
// //       return NextResponse.json(
// //         { success: false, error: 'Incorrect email or password' },
// //         { status: 401 }
// //       );
// //     }

// //     if (!user.isActive) {
// //       return NextResponse.json(
// //         { success: false, error: 'Your account has been deactivated. Please contact admin.' },
// //         { status: 401 }
// //       );
// //     }

// //     if (user.isLocked && user.isLocked()) {
// //       return NextResponse.json(
// //         { success: false, error: 'Account locked due to too many failed attempts. Try again later.' },
// //         { status: 401 }
// //       );
// //     }

// //     // ✅ Safe role extraction (with fallback)
// //     const roleName =
// //       typeof user.role === 'object'
// //         ? user.role?.name || 'customer'
// //         : user.role || 'customer';

// //     user.lastLogin = new Date();
// //     user.loginAttempts = 0;
// //     user.lockUntil = undefined;
// //     await user.save();

// //     // ✅ Generate token with roleType
// //     const token = generateToken({
// //       userId: user._id,
// //       email: user.email,
// //       role: roleName,
// //     });

// //     const response = NextResponse.json({
// //       success: true,
// //       data: {
// //         user: {
// //           id: user._id,
// //           firstName: user.firstName,
// //           lastName: user.lastName,
// //           email: user.email,
// //           role: roleName,
// //           fullName: user.fullName,
// //           profileImage: user.profileImage,
// //           permissions:
// //             typeof user.role === 'object' ? user.role?.permissions || [] : [],
// //         },
// //         token,
// //         roleType: roleName, // ✅ directly send role type for frontend routing
// //       },
// //       message: 'Login successful',
// //     });

// //     // ✅ Set cookie
// //     response.cookies.set('token', token, getCookieOptions());

// //     return response;
// //   } catch (error) {
// //     console.error('Login Error:', error);
// //     return NextResponse.json(
// //       {
// //         success: false,
// //         error: 'Login failed',
// //         details: error.message,
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }



// // app/api/auth/login/route.js
// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import User from '@/Models/User';
// import { generateToken, getCookieOptions } from '@/lib/jwt';

// export async function POST(request) {
//   try {
//     await connectDB();

//     const body = await request.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, error: 'Please provide email and password' },
//         { status: 400 }
//       );
//     }

//     // ✅ Find user with role AND vendorProfile populated
//     const user = await User.findOne({ email })
//       .populate('role') // Populate role document
//       .populate('vendorProfile'); // Populate vendor profile

//     if (!user || !(await user.correctPassword(password, user.password))) {
//       return NextResponse.json(
//         { success: false, error: 'Incorrect email or password' },
//         { status: 401 }
//       );
//     }

//     if (!user.isActive) {
//       return NextResponse.json(
//         { success: false, error: 'Your account has been deactivated. Please contact admin.' },
//         { status: 401 }
//       );
//     }

//     if (user.isLocked && user.isLocked()) {
//       return NextResponse.json(
//         { success: false, error: 'Account locked due to too many failed attempts. Try again later.' },
//         { status: 401 }
//       );
//     }

//     // ✅ IMPROVED: Better role extraction logic
//     let roleName = 'customer';
//     let rolePermissions = [];
//     let isVendor = user.isVendor || false;
//     let vendorProfile = null;

//     // Handle role logic
//     if (user.roleType === 'staff' && user.role) {
//       // Staff user with role
//       if (typeof user.role === 'object') {
//         roleName = user.role.name || 'staff';
//         rolePermissions = user.role.permissions || [];
//       } else {
//         roleName = 'staff';
//       }
//     } else if (user.isVendor) {
//       // Vendor user
//       roleName = 'vendor';
//       rolePermissions = ['vendor_access', 'manage_products', 'view_sales'];
//       isVendor = true;
      
//       // Handle vendor profile data
//       if (user.vendorProfile) {
//         if (typeof user.vendorProfile === 'object') {
//           vendorProfile = {
//             id: user.vendorProfile._id,
//             companyName: user.vendorProfile.companyName,
//             contactPerson: user.vendorProfile.contactPerson,
//             email: user.vendorProfile.email,
//             phone: user.vendorProfile.phone,
//             status: user.vendorProfile.status
//           };
//         }
//       }
//     } else {
//       // Customer user
//       roleName = 'customer';
//       rolePermissions = ['customer_access'];
//     }

//     // Update user login info
//     user.lastLogin = new Date();
//     user.loginAttempts = 0;
//     user.lockUntil = undefined;
//     await user.save();

//     // ✅ Generate token with complete user info
//     const token = generateToken({
//       userId: user._id,
//       email: user.email,
//       role: roleName,
//       roleType: user.roleType,
//       isVendor: isVendor,
//       permissions: rolePermissions
//     });

//     // ✅ Prepare user data for response
//     const userResponse = {
//       id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       fullName: user.fullName,
//       profileImage: user.profileImage,
//       phone: user.phone,
//       isActive: user.isActive,
//       isEmailVerified: user.isEmailVerified,
      
//       // Role Information
//       role: roleName,
//       roleType: user.roleType,
//       permissions: rolePermissions,
      
//       // Vendor Information
//       isVendor: isVendor,
//       vendorProfile: vendorProfile,
      
//       // Additional fields
//       department: user.department,
//       position: user.position,
//       employeeId: user.employeeId
//     };

//     const response = NextResponse.json({
//       success: true,
//       data: {
//         user: userResponse,
//         token,
//         roleType: roleName, // For easy frontend access
//       },
//       message: 'Login successful',
//     });

//     // ✅ Set cookie
//     response.cookies.set('token', token, getCookieOptions());

//     return response;
//   } catch (error) {
//     console.error('Login Error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Login failed',
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }





// app/api/auth/login/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/Models/User';
import { generateToken, getCookieOptions } from '@/lib/jwt';
// import Vendor from '@/Models/Vendor';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // ✅ Find user with ALL relevant populated fields
    const user = await User.findOne({ email })
      .populate('role') // Populate role document
      // .populate('vendorProfile'); // Populate vendor profile

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    // ✅ Check password
    if (!(await user.correctPassword(password, user.password))) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
      }
      await user.save();
      
      return NextResponse.json(
        { success: false, error: 'Incorrect email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact admin.' },
        { status: 401 }
      );
    }

    if (user.isLocked && user.lockUntil > Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Account locked due to too many failed attempts. Try again later.' },
        { status: 401 }
      );
    }

    // ✅ FIXED: SIMPLIFIED ROLE DETERMINATION LOGIC
    let roleName = 'customer';
    let rolePermissions = [];
    let isVendor = false;
    let vendorProfile = null;

    // DEBUG: Log user data to see actual values
    console.log('🔍 USER DATA:', {
      id: user._id,
      email: user.email,
      roleType: user.roleType,
      isVendor: user.isVendor,
      role: user.role,
      vendorProfile: user.vendorProfile
    });

    // ✅ PRIORITY 1: Check if user is explicitly marked as vendor
    if (user.isVendor === true) {
      roleName = 'vendor';
      isVendor = true;
      rolePermissions = ['vendor_access', 'manage_products', 'view_sales'];
      
      // Handle vendor profile
      if (user.vendorProfile && typeof user.vendorProfile === 'object') {
        vendorProfile = {
          id: user.vendorProfile._id,
          companyName: user.vendorProfile.companyName,
          contactPerson: user.vendorProfile.contactPerson,
          email: user.vendorProfile.email,
          phone: user.vendorProfile.phone,
          status: user.vendorProfile.status
        };
      }
    }
    // ✅ PRIORITY 2: Check roleType field
    else if (user.roleType && user.roleType !== 'customer') {
      roleName = user.roleType; // Use the roleType directly
      
      // Get permissions from role document if populated
      if (user.role && typeof user.role === 'object') {
        rolePermissions = user.role.permissions || [];
      } else {
        // Default permissions based on roleType
        switch (user.roleType) {
          case 'admin':
          case 'super_admin':
            rolePermissions = ['admin_access', 'manage_users', 'manage_products', 'view_reports'];
            break;
          case 'staff':
            rolePermissions = ['staff_access', 'manage_products', 'view_reports'];
            break;
          default:
            rolePermissions = ['customer_access'];
        }
      }
    }
    // ✅ PRIORITY 3: Check populated role document
    else if (user.role && typeof user.role === 'object') {
      roleName = user.role.name || 'customer';
      rolePermissions = user.role.permissions || [];
    }
    // ✅ PRIORITY 4: Default to customer
    else {
      roleName = 'customer';
      rolePermissions = ['customer_access'];
    }

    // ✅ Update user login info
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // ✅ Generate token with consistent role info
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: roleName, // This should NOT change
      roleType: user.roleType, // Keep original roleType
      isVendor: isVendor,
      permissions: rolePermissions
    };

    console.log('🎯 TOKEN PAYLOAD:', tokenPayload);

    const token = generateToken(tokenPayload);

    // ✅ Prepare consistent user data for response
    const userResponse = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      
      // Role Information - CONSISTENT
      role: roleName, // This should match token
      roleType: user.roleType, // Original roleType from database
      permissions: rolePermissions,
      
      // Vendor Information
      isVendor: isVendor,
      vendorProfile: vendorProfile,
      
      // Additional fields
      department: user.department,
      position: user.position,
      employeeId: user.employeeId
    };

    const response = NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
        roleType: roleName, // Same as role field
      },
      message: 'Login successful',
    });

    // ✅ Set cookie
    response.cookies.set('token', token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('🔴 Login Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}