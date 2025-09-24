'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/shared/Table';
import StatusTag from '../../../components/shared/StatusTag';
import Button from '../../../components/shared/Button';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import AuthService from '../../../libs/authService';
import {
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUser
} from 'react-icons/fi';

interface Payment {
  _id: string;
  studentId: string;
  matricNo: string;
  studentName: string;
  amount: number;
  description: string;
  paymentMethod: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionRef?: string;
  paymentDate?: string;
  dueDate: string;
  createdAt: string;
}

export default function BursaryPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      router.push('/');
      return;
    }

    const userRole = AuthService.getUserRole();
    if (userRole !== 'bursary' && userRole !== 'admin') {
      router.push('/');
      return;
    }

    fetchPayments();
  }, [router]);

  const fetchPayments = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: 'Paid' | 'Failed' | 'Refunded') => {
    try {
      setProcessingId(paymentId);
      
      const user = AuthService.getUserData();
      if (!user) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('/api/payments/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          paymentId,
          status: newStatus,
          adminId: user._id
        }),
      });

      if (response.ok) {
        // Update the local state to reflect the change
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: newStatus } 
              : payment
          )
        );
        
        alert(`Payment ${newStatus.toLowerCase()} successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update payment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('An error occurred while updating the payment status.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row: Payment) => (
        <div className="flex items-center">
          <FiCalendar className="mr-2 text-gray-400" size={14} />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Student',
      accessor: 'studentName',
      render: (row: Payment) => (
        <div className="flex items-center">
          <FiUser className="mr-2 text-blue-500" size={14} />
          <div>
            <div className="font-medium">{row.studentName}</div>
            <div className="text-xs text-gray-500">{row.matricNo}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row: Payment) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row: Payment) => (
        <div className="flex items-center">
          <FiDollarSign className="mr-1 text-green-500" size={14} />
          <span className="font-semibold text-green-600">
            ₦{row.amount.toLocaleString()}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Payment) => <StatusTag status={row.status} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row: Payment) => (
        <div className="flex space-x-2">
          {row.status === 'Pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleUpdateStatus(row._id, 'Paid')}
                disabled={processingId === row._id}
                className="flex items-center"
              >
                <FiCheckCircle className="mr-1" size={14} />
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleUpdateStatus(row._id, 'Failed')}
                disabled={processingId === row._id}
                className="flex items-center"
              >
                <FiXCircle className="mr-1" size={14} />
                Reject
              </Button>
            </>
          )}
          {row.status === 'Paid' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => handleUpdateStatus(row._id, 'Refunded')}
              disabled={processingId === row._id}
              className="flex items-center"
            >
              <FiRefreshCw className="mr-1" size={14} />
              Refund
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleRefresh = () => {
    fetchPayments(true);
  };

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
    <DashboardLayout title="Payment Approvals" role="bursary">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Student Payments</h2>
            <p className="text-sm text-gray-600 mt-1">Review and approve student payment requests</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Payments Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-indigo-500" />
              Payment Requests
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
              <h3 className="text-sm font-medium text-gray-900 mb-2">No payment requests</h3>
              <p className="text-sm text-gray-500">Payment requests will appear here when students make payments.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
