import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../Models/User';
import { generateToken, getCookieOptions } from '../../../../lib/jwt';

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

    // Find user and populate role (if it’s a reference)
    const user = await User.findOne({ email }).populate('role');

    if (!user || !(await user.correctPassword(password, user.password))) {
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

    if (user.isLocked && user.isLocked()) {
      return NextResponse.json(
        { success: false, error: 'Account locked due to too many failed attempts. Try again later.' },
        { status: 401 }
      );
    }

    // ✅ Safe role extraction (with fallback)
    const roleName =
      typeof user.role === 'object'
        ? user.role?.name || 'customer'
        : user.role || 'customer';

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // ✅ Generate token with roleType
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: roleName,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: roleName,
          fullName: user.fullName,
          profileImage: user.profileImage,
          permissions:
            typeof user.role === 'object' ? user.role?.permissions || [] : [],
        },
        token,
        roleType: roleName, // ✅ directly send role type for frontend routing
      },
      message: 'Login successful',
    });

    // ✅ Set cookie
    response.cookies.set('token', token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('Login Error:', error);
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
