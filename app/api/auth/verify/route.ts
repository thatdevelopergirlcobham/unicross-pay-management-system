import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const { user, error } = verifyToken(token);

    if (error || !user) {
      return error || NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Token is valid',
      user
    });

  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
