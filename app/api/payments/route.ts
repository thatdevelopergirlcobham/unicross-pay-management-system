import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Payment from '@/app/libs/models/Payment';
import User from '@/app/libs/models/User';

interface PaymentQuery {
  studentId?: string;
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: PaymentQuery = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('studentId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Payment creation request received');
    await connectDB();
    console.log('Database connected successfully');

    const body = await request.json();
    console.log('Request body:', body);

    const { studentId, amount, description, paymentMethod, dueDate } = body;

    if (!studentId || !amount || !description || !dueDate) {
      console.log('Missing required fields:', { studentId, amount, description, dueDate });
      return NextResponse.json(
        { error: 'Student ID, amount, description, and due date are required' },
        { status: 400 }
      );
    }

    // Get student information
    console.log('Looking for student with ID:', studentId);
    const student = await User.findById(studentId);

    if (!student) {
      console.log('Student not found:', studentId);
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log('Student found:', student._id);

    // Create new payment
    const newPayment = new Payment({
      studentId,
      matricNo: student.matricNo,
      studentName: `${student.firstName} ${student.lastName}`,
      amount: Number(amount),
      description,
      paymentMethod: paymentMethod || 'Online',
      dueDate: new Date(dueDate),
      status: 'Pending'
    });

    console.log('Saving payment to database:', newPayment);
    await newPayment.save();
    console.log('Payment saved successfully with ID:', newPayment._id);

    return NextResponse.json({
      message: 'Payment created successfully',
      payment: newPayment
    }, { status: 201 });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
