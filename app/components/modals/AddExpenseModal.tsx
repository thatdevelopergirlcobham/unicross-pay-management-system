'use client';
import Button from '../shared/Button';
import Input from '../shared/Input';

export default function AddExpenseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Log New Expense</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          <Input label="Amount (NGN)" id="amount" type="number" placeholder="e.g., 50000" required />
          <Input label="Description" id="description" type="text" placeholder="e.g., Office Stationery" required />
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <select id="department" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option>Registry</option>
              <option>Library</option>
              <option>Works & Services</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Log Expense</Button>
          </div>
        </form>
      </div>
    </div>
  );
}