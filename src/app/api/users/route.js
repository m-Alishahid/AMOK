import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/Models/User';
import { verifyToken } from '@/lib/jwt';

// GET all users (with pagination, filtering, sorting)
export async function GET(request) {
  try {
    await connectDB();

    // Verify token and check permissions
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(decoded.userId).populate('role');
    if (!currentUser.role.permissions.user.view) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Build filter
    let filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .populate('role')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('GET Users Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request) {
  try {
    await connectDB();

    // Verify token and check permissions
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(decoded.userId).populate('role');
    if (!currentUser.role.permissions.user.create) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Create user
    const user = await User.create({
      ...body,
      createdBy: currentUser._id
    });

    const newUser = await User.findById(user._id)
      .populate('role')
      .select('-password');

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('POST User Error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        details: error.message
      },
      { status: 500 }
    );
  }
}
