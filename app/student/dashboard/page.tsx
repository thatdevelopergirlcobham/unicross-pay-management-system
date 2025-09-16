/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import StatusTag from '../../components/shared/StatusTag';
import Button from '../../components/shared/Button';
import MakePaymentModal from '../../components/modals/MakePaymentModal';
import { FiFileText, FiDollarSign } from 'react-icons/fi';
import { dummyStudentPayments } from '../../libs/data';

export default function StudentDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [
    { header: 'Receipt ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusTag status={row.status} /> },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Welcome, Student!</h2>
          <Button onClick={() => setIsModalOpen(true)}>Make Payment</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total Paid" value="₦105,000" icon={<FiDollarSign size={24} />} />
          <DashboardCard title="Session" value="2024/2025" icon={<FiFileText size={24} />} />
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <Table columns={columns} data={dummyStudentPayments} />
        </div>
      </div>
      {isModalOpen && <MakePaymentModal onClose={() => setIsModalOpen(false)} onSubmit={() => { alert('Payment Submitted!'); setIsModalOpen(false); }} />}
    </>
  );
}