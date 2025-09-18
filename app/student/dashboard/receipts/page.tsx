/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import Table from '../../../components/shared/Table';
import StatusTag from '../../../components/shared/StatusTag';
import Button from '../../../components/shared/Button';
import ViewReceiptModal from '../../../components/modals/ViewReceiptModal';
import { dummyReceipts } from '../../../libs/data';

// Define the type for a receipt object
type Receipt = typeof dummyReceipts[0];

export default function ReceiptsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Receipt ID', accessor: 'receiptId' },
    { header: 'Date', accessor: 'date' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Amount', 
      accessor: 'amountPaid', 
      render: (row: Record<string, any>) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format((row as Receipt).amountPaid)
    },
    { header: 'Status', accessor: 'status', render: (row: Record<string, any>) => <StatusTag status={(row as Receipt).status} /> },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Record<string, any>) => (
        <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => handleViewReceipt(row as Receipt)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">My Receipts</h2>
        <Table columns={columns} data={dummyReceipts} />
      </div>

      {/* Conditionally render the modal */}
      <ViewReceiptModal
        receipt={selectedReceipt}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}