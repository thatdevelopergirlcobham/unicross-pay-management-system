'use client';
import { useState, useEffect } from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';

// A dictionary of fixed fees for different payment types
const fixedFees: { [key: string]: number } = {
  'School Fees': 75000,
  'Accommodation Fee': 30000,
  'Acceptance Fee': 25000,
  'ICT Levy': 10000,
};

// Main payment categories
const paymentCategories = [
  'School Fees',
  'Accommodation Fee',
  'Acceptance Fee',
  'ICT Levy',
  'Other',
];

export default function MakePaymentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void; }) {
  // State management
  const [paymentType, setPaymentType] = useState<string>(paymentCategories[0]);
  const [paymentOption, setPaymentOption] = useState<'Full' | 'Part'>('Full');
  const [fullAmount, setFullAmount] = useState<number>(0);
  const [amount, setAmount] = useState<number | string>('');

  // EFFECT 1: Runs when the main payment category (e.g., School Fees) changes.
  useEffect(() => {
    const newFullAmount = fixedFees[paymentType] || 0;
    setFullAmount(newFullAmount);
    setAmount(newFullAmount); // Default to the full amount
    setPaymentOption('Full'); // Reset to Full Payment on category change
  }, [paymentType]);

  // EFFECT 2: Runs when the user switches between Full and Part payment.
  useEffect(() => {
    if (paymentOption === 'Full') {
      setAmount(fullAmount);
    } else {
      setAmount(''); // Clear the amount for user input
    }
  }, [paymentOption, fullAmount]);

  const isFixedFee = fixedFees.hasOwnProperty(paymentType);
  const isAmountEditable = paymentOption === 'Part' || !isFixedFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Make a Payment</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          
          {/* Step 1: Select Fee Type */}
          <div>
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">Payment For</label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              {paymentCategories.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Choose Full or Part Payment (only for fixed fees) */}
          {isFixedFee && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Option</label>
              <div className="mt-2 flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="radio" value="Full" checked={paymentOption === 'Full'} onChange={() => setPaymentOption('Full')} className="h-4 w-4 text-indigo-600 border-gray-300" />
                  <span className="ml-2 text-sm text-gray-800">Full Payment ({new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(fullAmount)})</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" value="Part" checked={paymentOption === 'Part'} onChange={() => setPaymentOption('Part')} className="h-4 w-4 text-indigo-600 border-gray-300" />
                  <span className="ml-2 text-sm text-gray-800">Part Payment</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Enter Amount */}
          <div>
            <Input
              label="Amount to Pay (NGN)"
              id="amount"
              type="number"
              placeholder={isAmountEditable ? "Enter custom amount" : ""}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              readOnly={!isAmountEditable}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${!isAmountEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Proceed to Pay ₦{Number(amount).toLocaleString()}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}