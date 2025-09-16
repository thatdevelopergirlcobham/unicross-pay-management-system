import { ReactNode } from 'react';

type DashboardCardProps = { title: string; value: string; icon: ReactNode; };

export default function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center">
      <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}