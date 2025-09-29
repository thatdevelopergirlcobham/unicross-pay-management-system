'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/shared/Table';
import Button from '../../../components/shared/Button';
import ViewReceiptModal from '../../../components/modals/ViewReceiptModal';
import AuthService from '../../../libs/authService';

interface Receipt {
  _id: string;
  receiptId: string;
  paymentId: string;
  studentName: string;
  matricNo: string;
  date: string;
  description: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
}

interface Payment {
  _id: string;
  paymentId: string;
  matricNo: string;
  amount: number;
  feeType: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  studentName?: string;
  description?: string;
}

export default function ReceiptsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = AuthService.getUserData();

  const handleViewReceipt = (payment: Payment) => {
    setSelectedReceipt({
      _id: payment._id,
      receiptId: payment._id,
      paymentId: payment._id,
      studentName: payment.studentName || 'N/A',
      matricNo: payment.matricNo,
      date: new Date(payment.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: payment.description || payment.feeType,
      amountPaid: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!currentUser?.matricNo) {
        throw new Error('Student matriculation number not found');
      }

      const response = await fetch(
        `/api/payments?matricNo=${currentUser.matricNo}&status=Paid`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment information');
      }

      const { payments } = await response.json();
      setReceipts(payments || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.matricNo]);

  // ✅ FIX: run only once on mount, not on every re-render
  useEffect(() => {
    if (!AuthService.isAuthenticated() || !currentUser) {
      router.push('/');
      return;
    }
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty array ensures it runs only once

  const columns = [
    {
      header: 'Receipt ID',
      accessor: '_id',
      render: (row: Payment) => (
        <span className="font-mono text-sm">#{row._id.slice(-8).toUpperCase()}</span>
      ),
    },
    {
      header: 'Payment Type',
      accessor: 'feeType',
      render: (row: Payment) => (
        <span className="capitalize">{row.feeType?.toLowerCase() || 'N/A'}</span>
      ),
    },
    {
      header: 'Payment Time',
      accessor: 'createdAt',
      render: (row: Payment) => (
        <div className="text-sm text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row: Payment) => (
        <span className="font-semibold">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
          }).format(row.amount || 0)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Payment) => (
        <button
          onClick={() => handleViewReceipt(row)}
          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
        >
          View Receipt
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading your receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading receipts</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchReceipts}
            variant="primary"
            className="px-4 py-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Receipts</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage your payment receipts</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={fetchReceipts}
              variant="secondary"
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {currentUser?.matricNo
              ? `No payment receipts found for ${currentUser.matricNo}`
              : 'Your payment receipts will appear here once available.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={receipts} 
          />
        </div>
      )}

      {isModalOpen && selectedReceipt && (
        <ViewReceiptModal receipt={selectedReceipt} onClose={closeModal} />
      )}
    </div>
  );
}
