"use client"
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OrdersChartProps } from '@/types/Creatortypes/earnings';

const OrdersChart: React.FC<OrdersChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Orders</h3>
        <div className="text-sm text-gray-500">Orders & Referrals</div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                value, 
                name === 'orders' ? 'Orders' : 'New Referrals'
              ]}
              labelFormatter={(label) => `Day: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="orders" 
              fill="#3b82f6" 
              radius={[2, 2, 0, 0]} 
              name="orders"
            />
            <Bar 
              dataKey="referrals" 
              fill="#10b981" 
              radius={[2, 2, 0, 0]} 
              name="referrals"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrdersChart;