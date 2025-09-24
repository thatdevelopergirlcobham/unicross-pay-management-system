'use client';
import { useState } from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';

interface AddExpenseModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function AddExpenseModal({ onClose, onSubmit }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    department: 'Registry'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user from localStorage (assuming user is logged in)
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: formData.department,
          amount: parseFloat(formData.amount),
          description: formData.description,
          requestedBy: user._id || user.id
        }),
      });

      const responseData = await response.json();
      console.log('Expense API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (response.ok) {
        alert('Expense logged successfully!');
        onSubmit(); // Call the parent callback to refresh data
        onClose(); // Close the modal
      } else {
        console.error('Expense creation failed:', responseData);
        if (response.status === 404) {
          alert('User not found. Please login again.');
          // Clear invalid user data
          localStorage.removeItem('user');
          localStorage.removeItem('auth-token');
        } else {
          setError(responseData.error || 'Failed to log expense');
        }
      }
    } catch (error) {
      console.error('Error logging expense:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-6">Log New Expense</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (NGN)"
            id="expense-amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="e.g., 50000"
            required
          />
          <Input
            label="Description"
            id="expense-description"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Office Stationery"
            required
          />
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="Registry">Registry</option>
              <option value="Library">Library</option>
              <option value="Works & Services">Works & Services</option>
              <option value="ICT">ICT</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Logging...' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}