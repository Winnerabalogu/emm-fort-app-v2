"use client"
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EarningsChartProps, TimeRange } from '@/types/Creatortypes/earnings';

const EarningsChart: React.FC<EarningsChartProps> = ({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' }
  ];

  const formatCurrency = (value: number): string => `₦${value.toFixed(2)}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Earnings</h3>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              fontSize={12} 
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666" 
              fontSize={12} 
              tick={{ fill: '#666' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Earnings']}
              labelFormatter={(label) => `Day: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#ea580c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;