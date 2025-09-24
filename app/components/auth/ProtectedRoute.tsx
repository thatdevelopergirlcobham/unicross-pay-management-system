'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthService from '../libs/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthentication = async () => {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        router.push('/dashboard');
        return;
      }

      // Check role-based access
      if (requiredRole) {
        const userRole = AuthService.getUserRole();
        if (userRole !== requiredRole) {
          // Redirect to appropriate dashboard based on user's role
          const user = AuthService.getUserData();
          if (user) {
            router.push(AuthService.getDashboardPath(user.role));
          } else {
            router.push('/login');
          }
          return;
        }
      }

      // Auto-redirect if user is already authenticated and trying to access auth pages
      if (pathname === '/login' || pathname === '/register') {
        const user = AuthService.getUserData();
        if (user) {
          router.push(AuthService.getDashboardPath(user.role));
        }
      }
    };

    checkAuthentication();
  }, [router, pathname, requiredRole]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
