'use client';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/dashboard');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Administrator Login</h1>
          <p className="text-gray-500">Access management & reporting tools</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Admin Email" type="email" id="email" defaultValue="admin@uni.edu" />
          <Input label="Password" type="password" id="password" defaultValue="password" />
          {/* Using the Button component correctly */}
          <Button type="submit" className="w-full bg-blue-600 text-white rounded-md p-2">Sign In</Button>
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