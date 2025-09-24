/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import StatusTag from '../../components/shared/StatusTag';
import Button from '../../components/shared/Button';
import AddExpenseModal from '../../components/modals/AddExpenseModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AuthService from '../../libs/authService';
import {
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

interface Expense {
  _id: string;
  date: string;
  department: string;
  amount: string;
  status: string;
  description?: string;
  requestedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface DashboardStats {
  pendingExpenses: number;
  approvedThisMonth: number;
  revenueToday: number;
  totalExpenses: number;
}

export default function BursaryDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingExpenses: 0,
    approvedThisMonth: 0,
    revenueToday: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch expenses
      const expensesResponse = await fetch('/api/expenses');
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        const expenseList = expensesData.expenses || [];

        setExpenses(expenseList);

        // Calculate stats
        const pendingExpenses = expenseList
          .filter((expense: any) => expense.status === 'Pending')
          .reduce((sum: number, expense: any) => {
            const amount = parseFloat(String(expense.amount).replace(/[^0-9.-]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        const approvedThisMonth = expenseList
          .filter((expense: any) => expense.status === 'Approved')
          .reduce((sum: number, expense: any) => {
            const amount = parseFloat(String(expense.amount).replace(/[^0-9.-]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        const totalExpenses = expenseList
          .reduce((sum: number, expense: any) => {
            const amount = parseFloat(String(expense.amount).replace(/[^0-9.-]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        setStats({
          pendingExpenses,
          approvedThisMonth,
          revenueToday: 90000, // This would come from payments API
          totalExpenses
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const expenseColumns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row: any) => new Date(row.date).toLocaleDateString()
    },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: any) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description || 'No description'}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row: any) => (
        <span className="font-semibold text-green-600">
          ₦{parseFloat(String(row.amount).replace(/[^0-9.-]/g, '')).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => <StatusTag status={row.status} />
    },
    {
      header: 'Requested By',
      accessor: 'requestedBy',
      render: (row: any) => (
        <span className="text-sm text-gray-600">
          {row.requestedBy ? `${row.requestedBy.firstName} ${row.requestedBy.lastName}` : 'Unknown'}
        </span>
      )
    },
  ];

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <FiRefreshCw className="animate-spin h-5 w-5" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Bursary Portal" role="bursary">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Bursary Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Manage expenses and financial requests</p>
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
              Log Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            title="Pending Expenses"
            value={`₦${stats.pendingExpenses.toLocaleString()}`}
            icon={<FiClock className="text-orange-500" size={24} />}
          />
          <DashboardCard
            title="Approved This Month"
            value={`₦${stats.approvedThisMonth.toLocaleString()}`}
            icon={<FiCheckCircle className="text-green-500" size={24} />}
          />
          <DashboardCard
            title="Total Expenses"
            value={`₦${stats.totalExpenses.toLocaleString()}`}
            icon={<FiDollarSign className="text-blue-500" size={24} />}
          />
          <DashboardCard
            title="Revenue (Today)"
            value={`₦${stats.revenueToday.toLocaleString()}`}
            icon={<FiTrendingUp className="text-purple-500" size={24} />}
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-indigo-500" />
              Expense Requests
              {expenses.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  {expenses.length}
                </span>
              )}
            </h3>
            {expenses.length === 0 && (
              <div className="flex items-center text-gray-500 text-sm">
                <FiAlertCircle className="mr-1" />
                No expenses found
              </div>
            )}
          </div>

          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={expenseColumns} data={expenses} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No expenses yet</h3>
              <p className="text-sm text-gray-500 mb-4">Get started by logging your first expense.</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <FiPlus className="mr-2" />
                Log First Expense
              </Button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            fetchDashboardData(); // Refresh data after logging expense
          }}
        />
      )}
    </DashboardLayout>
  );
}