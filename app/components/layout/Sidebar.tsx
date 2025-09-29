'use client';

import Link from 'next/link';
import { FiGrid, FiFileText, FiLogOut, FiDollarSign } from 'react-icons/fi';

// The navigation items are well-structured for different roles.
const navItems = {
  student: [
    { href: '/student/dashboard', label: 'Dashboard', icon: FiGrid },
    { href: '/student/dashboard/receipts', label: 'My Receipts', icon: FiFileText },
  ],
  bursary: [
    { href: '/bursary/dashboard', label: 'Overview', icon: FiGrid },
    { href: '/bursary/dashboard/payments', label: 'Student Payments', icon: FiDollarSign },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Reports & Analytics', icon: FiFileText },
    { href: '/admin/payments', label: 'Payment Management', icon: FiDollarSign },
  ],
};

// Define a type for the component's props for better type-safety.
type SidebarProps = {
  role: keyof typeof navItems; // This ensures 'role' can only be 'student', 'bursary', or 'admin'
};

/**
 * A role-based sidebar component.
 * @param {SidebarProps} props - The component props.
 * @param {string} props.role - The current user's role ('student', 'bursary', or 'admin').
 */
export default function Sidebar({ role }: SidebarProps) {
  // Use the 'role' prop to dynamically get the correct navigation links.
  const currentNavItems = navItems[role] || []; // Fallback to an empty array just in case

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-indigo-600">UNI-PAY</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {currentNavItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center p-3 my-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 hover:text-indigo-600">
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center p-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600">
          <FiLogOut className="h-5 w-5 mr-3" />
          Logout
        </Link>
      </div>
    </aside>
  );
}