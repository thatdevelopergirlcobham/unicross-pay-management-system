'use client';
import { useState } from 'react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and auth token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        // Also store the auth token if available (for API calls)
        const token = data.token || response.headers.get('auth-token');
        if (token) {
          localStorage.setItem('auth-token', token);
        }
        router.push('/student/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Login</h1>
          <p className="text-gray-500">Access your payment portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            id="student-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@unicross.edu.ng"
            required
          />
          <Input
            label="Password"
            id="student-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md p-2"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>

      {/* Back to Home Link */}
      <Link href="/" className="mt-6 flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors">
        <FiArrowLeft className="mr-2" />
        Back to Home Portal
      </Link>
    </main>
  );
}