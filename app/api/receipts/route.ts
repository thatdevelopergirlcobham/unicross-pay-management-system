import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Receipt from '@/app/libs/models/Receipt';
import Payment from '@/app/libs/models/Payment';
import User from '@/app/libs/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const receiptId = searchParams.get('receiptId');
    const paymentId = searchParams.get('paymentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (receiptId) {
      query.receiptId = receiptId;
    }

    if (paymentId) {
      query.paymentId = { $in: paymentId.split(',') };
    }

    const receipts = await Receipt.find(query)
      .populate('studentId', 'firstName lastName email matricNo')
      .populate('paymentId')
      .populate('issuedBy', 'firstName lastName')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Receipt.countDocuments(query);

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      paymentId,
      issuedBy,
      receiptId,
      amountPaid,
      description,
      paymentMethod
    } = await request.json();

    if (!paymentId || !issuedBy || !receiptId || !amountPaid) {
      return NextResponse.json(
        { error: 'Payment ID, issued by, receipt ID, and amount paid are required' },
        { status: 400 }
      );
    }

    // Get payment information
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get issuer information
    const issuer = await User.findById(issuedBy);

    if (!issuer) {
      return NextResponse.json(
        { error: 'Issuer not found' },
        { status: 404 }
      );
    }

    // Check if receipt already exists
    const existingReceipt = await Receipt.findOne({ receiptId });

    if (existingReceipt) {
      return NextResponse.json(
        { error: 'Receipt ID already exists' },
        { status: 409 }
      );
    }

    // Update payment status
    payment.status = 'Paid';
    payment.paymentDate = new Date();
    await payment.save();

    // Create new receipt
    const newReceipt = new Receipt({
      paymentId,
      receiptId,
      studentId: payment.studentId,
      studentName: payment.studentName,
      matricNo: payment.matricNo,
      amountPaid,
      description: description || payment.description,
      paymentMethod: paymentMethod || payment.paymentMethod,
      status: 'Paid',
      issuedBy
    });

    await newReceipt.save();

    return NextResponse.json({
      message: 'Receipt created successfully',
      receipt: newReceipt
    }, { status: 201 });

  } catch (error) {
    console.error('Create receipt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
