import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import User from '@/app/libs/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Database connected successfully');

    // Test if we can query users
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);

    // Test if we can create a test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'student',
      isActive: true
    });

    await testUser.save();
    console.log('Test user created:', testUser._id);

    // Clean up the test user
    await User.deleteOne({ _id: testUser._id });
    console.log('Test user deleted');

    return NextResponse.json({
      message: 'Database connection test successful',
      userCount,
      testUserCreated: true
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
