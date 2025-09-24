import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Expense from '@/app/libs/models/Expense';
import User from '@/app/libs/models/User';

interface ExpenseQuery {
  status?: string;
  department?: string;
  requestedBy?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const requestedBy = searchParams.get('requestedBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: ExpenseQuery = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (requestedBy) {
      query.requestedBy = requestedBy;
    }

    const expenses = await Expense.find(query)
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Expense creation request received');
    await connectDB();
    console.log('Database connected successfully');

    const body = await request.json();
    console.log('Request body:', body);

    const { department, amount, description, requestedBy } = body;

    if (!department || !amount || !description || !requestedBy) {
      console.log('Missing required fields:', { department, amount, description, requestedBy });
      return NextResponse.json(
        { error: 'Department, amount, description, and requested by are required' },
        { status: 400 }
      );
    }

    // Verify the requester exists
    console.log('Looking for requester with ID:', requestedBy);
    const requester = await User.findById(requestedBy);

    if (!requester) {
      console.log('Requester not found:', requestedBy);
      return NextResponse.json(
        { error: 'Requester not found' },
        { status: 404 }
      );
    }

    console.log('Requester found:', requester._id);

    // Create new expense
    const newExpense = new Expense({
      department,
      amount: Number(amount),
      description,
      requestedBy,
      status: 'Pending'
    });

    console.log('Saving expense to database:', newExpense);
    await newExpense.save();
    console.log('Expense saved successfully with ID:', newExpense._id);

    return NextResponse.json({
      message: 'Expense created successfully',
      expense: newExpense
    }, { status: 201 });

  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { expenseId, status, approvedBy, receiptRef } = await request.json();

    if (!expenseId || !status) {
      return NextResponse.json(
        { error: 'Expense ID and status are required' },
        { status: 400 }
      );
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Update expense
    expense.status = status;

    if (status === 'Approved' && approvedBy) {
      expense.approvedBy = approvedBy;
      expense.approvedDate = new Date();
    }

    if (status === 'Paid' && receiptRef) {
      expense.paymentDate = new Date();
      expense.receiptRef = receiptRef;
    }

    await expense.save();

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense
    });

  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
