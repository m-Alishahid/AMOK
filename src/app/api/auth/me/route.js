import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/Models/User';
import Role from '@/Models/Role';

export async function GET(request) {
  try {
    await connectDB();

    // 1️⃣ Get token from cookie or Authorization header
    let token = request.cookies.get('token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2️⃣ Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 3️⃣ Fetch user with role populated
    const user = await User.findById(decoded.userId)
      .populate('role')
      .select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // 4️⃣ Handle null role safely
    const roleName =
      typeof user.role === 'object'
        ? user.role?.name || 'customer'
        : user.role || 'customer';

    const rolePermissions =
      typeof user.role === 'object' ? user.role?.permissions || [] : [];

    // 5️⃣ Response with safe structure
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          position: user.position,
          employeeId: user.employeeId,
          profileImage: user.profileImage,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          role: roleName,
          roleType: roleName, // ✅ extra shortcut for frontend logic
          permissions: rolePermissions,
        },
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
