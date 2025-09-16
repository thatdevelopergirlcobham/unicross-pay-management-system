'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid,  FiFileText, FiLogOut } from 'react-icons/fi';

const navItems = {
  student: [
    { href: '/student/dashboard', label: 'Dashboard', icon: FiGrid },
    // Add the new link here
    { href: '/student/dashboard/receipts', label: 'My Receipts', icon: FiFileText },
  ],
  bursary: [
    { href: '/bursary/dashboard', label: 'Overview', icon: FiGrid },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Reports & Analytics', icon: FiFileText },
  ],
};

// ... the rest of the component remains the same
export default function Sidebar() {
  const pathname = usePathname();
  const role = pathname.split('/')[1] as keyof typeof navItems || 'student';

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-indigo-600">UNI-PAY</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {(navItems[role]).map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`flex items-center p-3 my-1 rounded-md text-sm font-medium transition-colors ${pathname === item.href ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center p-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
          <FiLogOut className="h-5 w-5 mr-3" />
          Logout
        </Link>
      </div>
    </aside>
  );
}