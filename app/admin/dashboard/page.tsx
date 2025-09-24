/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AuthService from '../../libs/authService';
import OverviewChart from '../../components/charts/OverviewChart';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiDollarSign,
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiBarChart,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';

interface Report {
  _id: string;
  reportType: string;
  title: string;
  date: string;
  generatedBy: string;
  status: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  reportsGenerated: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 65800000,
    totalExpenses: 28300000,
    reportsGenerated: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch reports
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
        setStats(prev => ({ ...prev, reportsGenerated: reportsData.reports?.length || 0 }));
      }

      // Fetch payments for revenue calculation
      const paymentsResponse = await fetch('/api/payments?status=Paid');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const totalRevenue = paymentsData.payments?.reduce((sum: number, payment: any) => {
          const amount = parseFloat(payment.amount?.replace(/[^0-9.-]/g, '') || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0;

        setStats(prev => ({ ...prev, totalRevenue }));
      }

      // Fetch expenses for expense calculation
      const expensesResponse = await fetch('/api/expenses');
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        const totalExpenses = expensesData.expenses?.reduce((sum: number, expense: any) => {
          const amount = parseFloat(expense.amount?.replace(/[^0-9.-]/g, '') || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0;

        setStats(prev => ({ ...prev, totalExpenses }));
      }

      // Fetch users for active users count
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const activeUsers = usersData.users?.filter((user: any) => user.isActive).length || 0;
        setStats(prev => ({ ...prev, activeUsers }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    // Implement report download functionality
    console.log('Downloading report:', report.title);
  };

  const columns = [
    {
      header: 'Report Type',
      accessor: 'reportType',
      render: (row: any) => (
        <div className="flex items-center">
          <FiFileText className="mr-2 text-indigo-500" />
          <span className="font-medium">{row.reportType}</span>
        </div>
      )
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (row: any) => (
        <div className="max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      )
    },
    {
      header: 'Date Generated',
      accessor: 'date',
      render: (row: any) => new Date(row.date).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: any) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'Generated'
            ? 'bg-green-100 text-green-800'
            : row.status === 'Processing'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: any) => (
        <Button
          variant="secondary"
          onClick={() => handleDownloadReport(row)}
          className="flex items-center"
        >
          <FiDownload className="mr-1" size={14} />
          Download
        </Button>
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
    <DashboardLayout title="Admin Portal" role="admin">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Administrator Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">System overview and analytics</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            title="Total Revenue (YTD)"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon={<FiTrendingUp className="text-green-500" size={24} />}
          />
          <DashboardCard
            title="Total Expenses (YTD)"
            value={`₦${stats.totalExpenses.toLocaleString()}`}
            icon={<FiTrendingDown className="text-red-500" size={24} />}
          />
          <DashboardCard
            title="Reports Generated"
            value={stats.reportsGenerated.toString()}
            icon={<FiFileText className="text-blue-500" size={24} />}
          />
          <DashboardCard
            title="Active Users"
            value={stats.activeUsers.toString()}
            icon={<FiUsers className="text-purple-500" size={24} />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiBarChart className="mr-2 text-indigo-500" />
                Financial Overview
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <FiActivity className="mr-1" />
                Live Data
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <OverviewChart />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiPieChart className="mr-2 text-indigo-500" />
                Quick Stats
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiDollarSign className="mr-3 text-green-500" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Net Profit</p>
                    <p className="text-xs text-gray-500">Revenue - Expenses</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  ₦{(stats.totalRevenue - stats.totalExpenses).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiTrendingUp className="mr-3 text-blue-500" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Growth Rate</p>
                    <p className="text-xs text-gray-500">Month over month</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  +15.3%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiUsers className="mr-3 text-purple-500" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Health</p>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiFileText className="mr-2 text-indigo-500" />
                Available Reports
                {reports.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                    {reports.length}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Generated reports and analytics</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center">
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Generate New Report
            </Button>
          </div>

          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={columns} data={reports} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-sm text-gray-500 mb-4">Generate your first report to get started.</p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                <FiBarChart className="mr-2" />
                Generate First Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}