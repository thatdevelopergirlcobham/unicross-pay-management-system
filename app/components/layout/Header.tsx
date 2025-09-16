'use client';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const role = pathname.split('/')[1] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold capitalize text-gray-800">{role} Dashboard</h2>
    </header>
  );
}