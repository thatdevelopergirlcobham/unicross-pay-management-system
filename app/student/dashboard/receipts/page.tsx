'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/shared/Table';
import StatusTag from '../../../components/shared/StatusTag';
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

export default function ReceiptsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = AuthService.getUserData();

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Verify user is authenticated
    if (!AuthService.isAuthenticated() || !currentUser) {
      router.push('/login');
      return;
    }

    fetchReceipts();
  }, [router, currentUser, fetchReceipts]);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/receipts?studentId=${currentUser?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      setReceipts(data.receipts || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Receipt ID', accessor: 'receiptId' },
    { header: 'Date', accessor: 'date' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Amount',
      accessor: 'amountPaid',
      render: (row: Receipt) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(row.amountPaid)
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row: Receipt) => <StatusTag status={row.status} /> 
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Receipt) => (
        <Button 
          variant="secondary" 
          className="!px-3 !py-1 text-xs" 
          onClick={() => handleViewReceipt(row)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading your receipts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">My Receipts</h2>
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          {error}
          <button 
            onClick={fetchReceipts}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
        
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No receipts found.</p>
            <p className="text-sm text-gray-400 mt-2">
              {currentUser?.matricNo ? 
                `No receipts found for ${currentUser.matricNo}` : 
                'Your payment receipts will appear here once available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-6">
            <Table 
              columns={columns} 
              data={receipts}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Receipts</h2>
        <Button 
          onClick={fetchReceipts}
          variant="primary"
          className="px-4 py-2"
        >
          Refresh
        </Button>
      </div>
      
      {receipts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No receipts found.</p>
          <p className="text-sm text-gray-400 mt-2">
            {currentUser?.matricNo ? 
              `No receipts found for ${currentUser.matricNo}` : 
              'Your payment receipts will appear here once available.'}
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
        <ViewReceiptModal
          receipt={selectedReceipt}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}