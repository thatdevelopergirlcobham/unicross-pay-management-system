/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import StatusTag from '../../components/shared/StatusTag';
import Button from '../../components/shared/Button';
import MakePaymentModal from '../../components/modals/MakePaymentModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import AuthService from '../../libs/authService';
import {
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiRefreshCw,
  FiPlus,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

interface Payment {
  _id: string;
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  receiptId?: string;
  paymentMethod?: string;
}

interface DashboardStats {
  totalPaid: number;
  session: string;
  pendingPayments: number;
  completedPayments: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 0,
    session: '2024/2025',
    pendingPayments: 0,
    completedPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const { toasts, removeToast, error: showError } = useToast();

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch payments (show all payments, not just paid ones)
      const paymentsResponse = await fetch('/api/payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const paymentList = paymentsData.payments || [];
        
        // Map the payment data to match the expected format
        const mappedPayments = paymentList.map((payment: any) => ({
          _id: payment._id,
          id: payment._id ? payment._id.slice(-8) : 'N/A',
          date: payment.createdAt || payment.paymentDate || new Date().toISOString(),
          description: payment.description || 'No description',
          amount: payment.amount || 0,
          status: payment.status || 'Unknown',
          receiptId: payment.transactionRef || '',
          paymentMethod: payment.paymentMethod || 'Unknown'
        }));
        
        setPayments(mappedPayments);

        // Calculate stats from payments
        const totalPaid = paymentList
          .filter((payment: any) => payment.status === 'Paid')
          .reduce((sum: number, payment: any) => {
            const amount = parseFloat(String(payment.amount || 0).replace(/[^0-9.-]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        const completedPayments = paymentList.filter((payment: any) => payment.status === 'Paid').length;
        const pendingPayments = paymentList.filter((payment: any) => payment.status === 'Pending').length;

        setStats({
          totalPaid,
          session: '2024/2025',
          pendingPayments,
          completedPayments
        });
        setDataFetched(true);
      } else {
        showError('API Error', `Failed to fetch payments: ${paymentsResponse.status}`);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to Load Data', 'Unable to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      router.push('/student/login');
      return;
    }

    // Only fetch data if not already fetched
    if (!dataFetched) {
      fetchDashboardData();
    }
  }, [router, dataFetched, fetchDashboardData]);

  const columns = [
    {
      header: 'Receipt ID',
      accessor: 'id',
      render: (row: any) => (
        <div className="flex items-center">
          <FiFileText className="mr-2 text-indigo-500" />
          <span className="font-medium">{row.id || (row._id ? row._id.slice(-8) : 'N/A')}</span>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row: any) => {
        try {
          const date = row.date ? new Date(row.date).toLocaleDateString() : 'N/A';
          return (
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-gray-400" size={14} />
              {date}
            </div>
          );
        } catch  {
          return (
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-gray-400" size={14} />
              N/A
            </div>
          );
        }
      }
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: any) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row: any) => (
        <div className="flex items-center">
          <FiDollarSign className="mr-1 text-green-500" size={14} />
          <span className="font-semibold text-green-600">
            ₦{row.amount ? parseFloat(String(row.amount).replace(/[^0-9.-]/g, '')).toLocaleString() : '0'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => (
        <div className="flex items-center">
          {row.status === 'Paid' ? (
            <FiCheckCircle className="mr-2 text-green-500" size={14} />
          ) : (
            <FiClock className="mr-2 text-orange-500" size={14} />
          )}
          <StatusTag status={row.status} />
        </div>
      )
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod',
      render: (row: any) => (
        <div className="flex items-center">
          <FiCreditCard className="mr-2 text-blue-500" size={14} />
          <span className="text-sm text-gray-600">
            {row.paymentMethod || 'Online'}
          </span>
        </div>
      )
    },
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Portal" role="student">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <FiRefreshCw className="animate-spin h-5 w-5" />
            <span className="text-lg">Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <DashboardLayout title="Student Portal" role="student">
        <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Welcome, Student!</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your payments and view receipts</p>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 sm:flex-none"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <FiPlus className="mr-2" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            title="Total Paid"
            value={`₦${stats.totalPaid.toLocaleString()}`}
            icon={<FiDollarSign className="text-green-500" size={24} />}
          />
          <DashboardCard
            title="Completed Payments"
            value={stats.completedPayments.toString()}
            icon={<FiCheckCircle className="text-blue-500" size={24} />}
          />
          <DashboardCard
            title="Pending Payments"
            value={stats.pendingPayments.toString()}
            icon={<FiClock className="text-orange-500" size={24} />}
          />
          <DashboardCard
            title="Payment Success Rate"
            value={`${stats.completedPayments + stats.pendingPayments > 0 ? Math.round((stats.completedPayments / (stats.completedPayments + stats.pendingPayments)) * 100) : 0}%`}
            icon={<FiTrendingUp className="text-purple-500" size={24} />}
          />
        </div>

        {/* Payment History */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-indigo-500" />
              Payment History
              {payments.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  {payments.length}
                </span>
              )}
            </h3>
            {payments.length === 0 && (
              <div className="flex items-center text-gray-500 text-sm">
                <FiAlertCircle className="mr-1" />
                No payments found
              </div>
            )}
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={columns} data={payments} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No payment history</h3>
              <p className="text-sm text-gray-500 mb-4">Make your first payment to get started.</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <FiPlus className="mr-2" />
                Make First Payment
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiCreditCard className="mr-2 text-indigo-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg"
            >
              <FiPlus className="mr-2" />
              Make Payment
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open('/student/dashboard/receipts', '_blank')}
              className="flex items-center justify-center p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg"
            >
              <FiFileText className="mr-2" />
              View Receipts
            </Button>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <MakePaymentModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            fetchDashboardData(); // Refresh data after payment
          }}
        />
      )}
      </DashboardLayout>
    </>
  );
}
