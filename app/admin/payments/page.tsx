'use client';
import { useState, useEffect } from 'react';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import StatusTag from '../../components/shared/StatusTag';
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiDollarSign
} from 'react-icons/fi';

interface Payment {
  _id: string;
  studentId: string;
  matricNo: string;
  studentName: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentDate?: string;
  dueDate: string;
  createdAt: string;
}

interface DashboardStats {
  totalPayments: number;
  pendingPayments: number;
  approvedPayments: number;
  totalAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        const paymentList = data.payments || [];
        setPayments(paymentList);

        // Calculate stats
        const totalAmount = paymentList.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
        const pendingPayments = paymentList.filter((payment: Payment) => payment.status === 'Pending').length;
        const approvedPayments = paymentList.filter((payment: Payment) => payment.status === 'Paid').length;

        setStats({
          totalPayments: paymentList.length,
          pendingPayments,
          approvedPayments,
          totalAmount
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'Paid' | 'Failed') => {
    try {
      setUpdating(paymentId);
      const response = await fetch('/api/payments/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          status
        }),
      });

      if (response.ok) {
        await fetchPayments(); // Refresh the list
        alert(`Payment ${status.toLowerCase()} successfully!`);
      } else {
        const errorData = await response.json();
        alert('Failed to update payment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Network error. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    {
      header: 'Student',
      accessor: 'studentName',
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.studentName}</div>
          <div className="text-sm text-gray-500">{row.matricNo}</div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row: any) => (
        <span className="font-semibold text-green-600">
          ₦{row.amount.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => <StatusTag status={row.status} />
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row: any) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: any) => (
        <div className="flex space-x-2">
          {row.status === 'Pending' && (
            <>
              <Button
                onClick={() => updatePaymentStatus(row._id, 'Paid')}
                disabled={updating === row._id}
                className="bg-green-600 hover:bg-green-700 text-sm px-2 py-1"
              >
                <FiCheckCircle className="mr-1" size={14} />
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => updatePaymentStatus(row._id, 'Failed')}
                disabled={updating === row._id}
                className="bg-red-600 hover:bg-red-700 text-sm px-2 py-1"
              >
                <FiXCircle className="mr-1" size={14} />
                Reject
              </Button>
            </>
          )}
          {row.status !== 'Pending' && (
            <span className="text-sm text-gray-500">
              {row.status === 'Paid' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <FiRefreshCw className="animate-spin h-5 w-5" />
          <span className="text-lg">Loading payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Payment Management</h2>
          <p className="text-gray-600">Approve or reject student payments</p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Payments"
          value={stats.totalPayments.toString()}
          icon={<FiFileText className="text-blue-500" size={24} />}
        />
        <DashboardCard
          title="Pending Approval"
          value={stats.pendingPayments.toString()}
          icon={<FiRefreshCw className="text-orange-500" size={24} />}
        />
        <DashboardCard
          title="Approved"
          value={stats.approvedPayments.toString()}
          icon={<FiCheckCircle className="text-green-500" size={24} />}
        />
        <DashboardCard
          title="Total Amount"
          value={`₦${stats.totalAmount.toLocaleString()}`}
          icon={<FiDollarSign className="text-purple-500" size={24} />}
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiFileText className="mr-2 text-indigo-500" />
            All Payments
            {payments.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                {payments.length}
              </span>
            )}
          </h3>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table columns={columns} data={payments} />
          </div>
        ) : (
          <div className="text-center py-8">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-sm text-gray-500">Payments will appear here when students make payments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
