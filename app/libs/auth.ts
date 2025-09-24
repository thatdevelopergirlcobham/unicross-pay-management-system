import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthUser {
  _id: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  matricNo?: string;
}

export function generateToken(user: { _id: string; email: string; role: string; firstName: string; lastName: string; isActive: boolean; matricNo?: string }): string {
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      matricNo: user.matricNo,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
}

export function verifyToken(token: string): { user: AuthUser | null; error: NextResponse | null } {
  try {
    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    if (!decoded.userId || !decoded.email || !decoded.role) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid token payload' },
          { status: 401 }
        )
      };
    }

    return { user: decoded as AuthUser, error: null };

  } catch {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    };
  }
}

export async function getAuthUser(request: NextRequest): Promise<{ user: AuthUser | null; error: NextResponse | null }> {
  try {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'No authentication token provided' },
          { status: 401 }
        )
      };
    }

    const { user, error } = verifyToken(token);

    if (error || !user) {
      return { user: null, error: error || NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
    }

    // Verify user still exists and is active in database
    await connectDB();
    const dbUser = await User.findById(user.userId);

    if (!dbUser || !dbUser.isActive) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid or deactivated user' },
          { status: 401 }
        )
      };
    }

    return { user: dbUser.toObject() as AuthUser, error: null };

  } catch {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    };
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  });
}
