/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import StatusTag from '../../components/shared/StatusTag';
import Button from '../../components/shared/Button';
import AddExpenseModal from '../../components/modals/AddExpenseModal';
import { FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { dummyExpenses } from '../../libs/data';

export default function BursaryDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const expenseColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Department', accessor: 'department' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusTag status={row.status} /> },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Bursary Overview</h2>
          <Button onClick={() => setIsModalOpen(true)}>Log Expense</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Pending Expenses" value="₦50,000" icon={<FiClock size={24} />} />
          <DashboardCard title="Approved This Month" value="₦1.2M" icon={<FiCheckCircle size={24} />} />
          <DashboardCard title="Revenue (Today)" value="₦90,000" icon={<FiTrendingUp size={24} />} />
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Expense Requests</h3>
          <Table columns={expenseColumns} data={dummyExpenses} />
        </div>
      </div>
      {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onSubmit={() => { alert('Expense Logged!'); setIsModalOpen(false); }} />}
    </>
  );
}