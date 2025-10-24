import { NextResponse } from 'next/server';
import User from '@/Models/User';
import connectDB from '../../../../lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();

    const { firstName, lastName, email, password, phone } = await req.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Create new customer user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      roleType: 'customer', // default ecommerce user
      isActive: true
    });

    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          roleType: newUser.roleType
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
