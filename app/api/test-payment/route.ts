import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Payment from '@/app/libs/models/Payment';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing payment creation...');
    await connectDB();
    console.log('Database connected successfully');

    // Test if we can query existing payments
    const paymentCount = await Payment.countDocuments();
    console.log('Total payments in database:', paymentCount);

    // Get a test user to use for the payment
    const testUser = await Payment.findOne();
    if (!testUser) {
      return NextResponse.json({
        message: 'No test user found. Please create a user first.',
        paymentCount
      });
    }

    // Test if we can create a test payment
    const testPayment = new Payment({
      studentId: testUser.studentId,
      matricNo: 'TEST123',
      studentName: 'Test Student',
      amount: 50000,
      description: 'Test Payment',
      paymentMethod: 'Online',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Pending'
    });

    await testPayment.save();
    console.log('Test payment created:', testPayment._id);

    // Clean up the test payment
    await Payment.deleteOne({ _id: testPayment._id });
    console.log('Test payment deleted');

    return NextResponse.json({
      message: 'Payment creation test successful',
      paymentCount,
      testPaymentCreated: true
    });

  } catch (error) {
    console.error('Payment test error:', error);
    return NextResponse.json(
      { error: 'Payment test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
