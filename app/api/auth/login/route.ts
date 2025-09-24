import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@/app/libs/mongodb';
import User from '@/app/libs/models/User';
import { generateToken, setAuthCookie } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('Database connected successfully');

    const { email, password } = await request.json();
    console.log('Received payload:', { email, password });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log('Querying user with email:', trimmedEmail);

    const user = await User.findOne({ email: trimmedEmail });
    console.log('User found:', user ? user.email : 'No user found');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This account has been deactivated.' },
        { status: 403 }
      );
    }

    console.log('Stored password hash:', user.password);
    const isPasswordValid = await bcrypt.compare(password.trim(), user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;

    const response = NextResponse.json({
      message: 'Login successful!',
      user: userData,
      token: token
    });

    setAuthCookie(response, token);
    return response;

  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}