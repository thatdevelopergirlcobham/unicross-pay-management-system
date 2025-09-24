import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Payment from '@/app/libs/models/Payment';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { paymentId, status, adminId } = await request.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    if (!['Pending', 'Paid', 'Failed', 'Refunded'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    payment.status = status;

    if (status === 'Paid') {
      payment.paymentDate = new Date();
    }

    await payment.save();

    return NextResponse.json({
      message: 'Payment status updated successfully',
      payment
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
