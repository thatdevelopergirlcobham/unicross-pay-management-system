import { ReactNode } from 'react';

type TableColumn<T = Record<string, unknown>> = { 
  header: string; 
  accessor: string; 
  render?: (row: T) => ReactNode; 
};

type TableProps<T = Record<string, unknown>> = { 
  columns: TableColumn<T>[]; 
  data: T[]; 
};

export default function Table<T = Record<string, unknown>>({ columns, data }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.accessor] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}