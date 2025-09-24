'use client';

interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  matricNo?: string;
  loginTime?: string;
}

class AuthService {
  private static readonly USER_KEY = 'user';
  private static readonly TOKEN_KEY = 'auth-token';

  // Save user data and token to localStorage
  static saveUserData(user: User, token: string) {
    const userData = {
      ...user,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get user data from localStorage
  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Get token from localStorage
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  // Clear authentication data
  static clearAuthData() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const user = this.getUserData();
    const token = this.getToken();
    return !!(user && token);
  }

  // Get user role
  static getUserRole(): string | null {
    const user = this.getUserData();
    return user?.role || null;
  }

  // Get dashboard path based on role
  static getDashboardPath(role: string): string {
    return `/${role}/dashboard`;
  }

  // Auto-login user if data exists in localStorage
  static async autoLogin(): Promise<{ user: User | null; token: string | null }> {
    const user = this.getUserData();
    const token = this.getToken();

    if (!user || !token) {
      return { user: null, token: null };
    }

    try {
      // Verify token with server
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        return { user, token };
      } else {
        // Token invalid, clear localStorage
        this.clearAuthData();
        return { user: null, token: null };
      }
    } catch {
      return { user: null, token: null };
    }
  }
}

export default AuthService;
