/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { FiUser, FiBriefcase, FiSettings } from 'react-icons/fi';

const PortalCard = ({ href, icon, title, description }: any) => (
  <Link href={href}>
    <div className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 text-center">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 text-center">{description}</p>
    </div>
  </Link>
);

export default function PortalPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-600">UNICROSS-PAY Portal</h1>
        <p className="mt-2 text-lg text-gray-600">Your Gateway to University Financial Management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <PortalCard
          href="/student/login"
          icon={<FiUser className="h-6 w-6 text-indigo-600 group-hover:text-white" />}
          title="Student Portal"
          description="Pay fees, view payment history, and generate receipts."
        />
        <PortalCard
          href="/bursary/login"
          icon={<FiBriefcase className="h-6 w-6 text-indigo-600 group-hover:text-white" />}
          title="Bursary Portal"
          description="Manage expenses, verify payments, and oversee transactions."
        />
        <PortalCard
          href="/admin/login"
          icon={<FiSettings className="h-6 w-6 text-indigo-600 group-hover:text-white" />}
          title="Admin Portal"
          description="Generate financial reports and access audit trails."
        />
      </div>
    </main>
  );
}