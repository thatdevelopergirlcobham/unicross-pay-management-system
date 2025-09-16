'use client';
import { chartData } from '../../libs/data';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

export default function OverviewChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `₦${value}M`} />
          <Tooltip
            cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
            formatter={(value) => [`₦${value}M`, '']}
            labelStyle={{ color: '#1F2937' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#a5b4fc" name="Expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}