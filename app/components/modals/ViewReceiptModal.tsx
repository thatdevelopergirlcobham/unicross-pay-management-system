'use client';

import { FiX, FiPrinter } from 'react-icons/fi';
import Button from '../shared/Button';

// Define a type for the receipt object for better type safety
type Receipt = {
  receiptId: string;
  studentName: string;
  matricNo: string;
  date: string;
  description: string;
  amountPaid: number;
  paymentMethod: string;
};

// A helper component for displaying receipt details
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

export default function ViewReceiptModal({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void; }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Receipt Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Receipt Content (This is the part that will be printed) */}
        <div id="receipt-content" className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-indigo-600">UNI-PAY</h1>
            <p className="text-gray-500">Official Payment Receipt</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
            <DetailRow label="Student Name" value={receipt.studentName} />
            <DetailRow label="Matriculation No." value={receipt.matricNo} />
            <DetailRow label="Receipt ID" value={receipt.receiptId} />
            <DetailRow label="Payment Date" value={receipt.date} />
          </div>
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 text-gray-800">{receipt.description}</td>
                  <td className="py-4 text-right font-bold text-gray-900">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(receipt.amountPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center pt-4">
            <p className="text-2xl font-bold text-green-600 border-2 border-green-600 rounded-lg py-2 px-4 inline-block transform -rotate-6">
              PAID
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-4 p-4 bg-gray-50 border-t">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={() => window.print()}>
            <FiPrinter className="mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      {/* Print styles to hide buttons when printing */}
      <style jsx global>{`
        @media print {
          body > *:not(#receipt-content) {
            display: none;
          }
          #receipt-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}