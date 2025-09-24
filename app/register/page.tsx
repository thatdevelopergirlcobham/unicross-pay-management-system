'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiBriefcase, FiSettings } from 'react-icons/fi';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';

type UserRole = 'student' | 'bursary' | 'admin';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  matricNo?: string;
}

const roleConfig = {
  student: {
    icon: <FiUser className="h-6 w-6 text-indigo-600 group-hover:text-white" />,
    title: 'Student Registration',
    description: 'Create account for student portal access',
    showMatricNo: true
  },
  bursary: {
    icon: <FiBriefcase className="h-6 w-6 text-indigo-600 group-hover:text-white" />,
    title: 'Bursary Registration',
    description: 'Create account for bursary portal access',
    showMatricNo: false
  },
  admin: {
    icon: <FiSettings className="h-6 w-6 text-indigo-600 group-hover:text-white" />,
    title: 'Admin Registration',
    description: 'Create account for admin portal access',
    showMatricNo: false
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    matricNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      matricNo: role === 'student' ? prev.matricNo : undefined
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.role === 'student' && !formData.matricNo) {
      setError('Matriculation number is required for students');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'student' && { matricNo: formData.matricNo })
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to localStorage for auto-login
        const userData = {
          ...data.user,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth-token', data.token || '');

        setSuccess(true);
        setTimeout(() => {
          // Redirect to appropriate dashboard based on role
          router.push(`/${formData.role}/dashboard`);
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <FiUser className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Registration Successful!</h1>
            <p className="text-gray-500 mt-2">Your account has been created successfully.</p>
            <p className="text-sm text-gray-400 mt-1">Redirecting to your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  const currentRoleConfig = roleConfig[formData.role];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500">Choose your portal and register</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Select Portal</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(roleConfig).map(([role, config]) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role as UserRole)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === role
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center">
                    {config.icon}
                  </div>
                  <div className="text-xs font-medium text-gray-900">{config.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {currentRoleConfig.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">{currentRoleConfig.title}</h3>
                <p className="text-xs text-indigo-700">{currentRoleConfig.description}</p>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First name"
              required
            />
            <Input
              label="Last Name"
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last name"
              required
            />
          </div>

          {/* Email */}
          <Input
            label="Email Address"
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@unicross.edu.ng"
            required
          />

          {/* Matriculation Number (only for students) */}
          {currentRoleConfig.showMatricNo && (
            <Input
              label="Matriculation Number"
              id="matricNo"
              type="text"
              name="matricNo"
              value={formData.matricNo || ''}
              onChange={handleInputChange}
              placeholder="UNC/21/5001"
              required
            />
          )}

          {/* Password Fields */}
          <Input
            label="Password"
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 6 characters"
            required
          />
          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
          />

          <Button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md p-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href={`/${formData.role}/dashboard`}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Back to Home Link */}
      <Link href="/" className="mt-6 flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors">
        <FiArrowLeft className="mr-2" />
        Back to Home Portal
      </Link>
    </main>
  );
}
