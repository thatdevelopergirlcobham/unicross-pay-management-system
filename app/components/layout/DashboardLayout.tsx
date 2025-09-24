'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '../../libs/authService';

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

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: string;
}

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      const userData = AuthService.getUserData();
      if (userData) {
        setUser(userData);
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    AuthService.clearAuthData();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
