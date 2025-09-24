import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import User from '@/app/libs/models/User';
import { generateToken, setAuthCookie } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, role, firstName, lastName, matricNo } = await request.json();

    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(matricNo ? [{ matricNo }] : [])
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or matriculation number' },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by the pre-save hook)
    const newUser = new User({
      email: email.toLowerCase(),
      password: password, // Let the pre-save hook handle hashing
      role,
      firstName,
      lastName,
      matricNo: matricNo || undefined,
      isActive: true
    });

    await newUser.save();

    // Generate authentication token
    const token = generateToken(newUser);

    // Return user data (excluding password) with authentication
    const userData = newUser.toObject();
    delete userData.password;

    const response = NextResponse.json({
      message: 'User created successfully and logged in',
      user: userData
    }, { status: 201 });

    // Set authentication cookie
    setAuthCookie(response, token);

    return response;

  } catch (error) {
    console.error('Registration error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
