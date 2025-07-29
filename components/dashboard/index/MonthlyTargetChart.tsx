// components/dashboard/index/MonthlyTargetChart.tsx
"use client";
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import { LineChart } from 'lucide-react';
import { formatNaira } from '@/lib/utils/formatCurrency';

// Define the shape of the data prop
type TimeRange = 'monthly' | 'quarterly' | 'yearly';
type ChartData = { name: string; value: number };

interface ChartProps {
    chartData: {
      monthly: ChartData[];
      quarterly: ChartData[];
      yearly: ChartData[];
    };
}

const MonthlyTargetChart = ({ chartData }: ChartProps) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('monthly');

  const dataToDisplay = chartData[activeRange] || [];
  
  const buttons: { id: TimeRange; label: string }[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-ui-surface shadow-soft flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="font-semibold text-lg text-text-primary">Target Progress</h3>
        
        {/* Interactive Toggle Buttons */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-full text-sm self-end sm:self-center">
          {buttons.map(button => (
            <button
              key={button.id}
              onClick={() => setActiveRange(button.id)}
              className={`px-4 py-1 rounded-full font-semibold transition-colors ${
                activeRange === button.id
                  ? 'bg-white shadow-sm text-text-primary'
                  : 'text-text-secondary hover:bg-white/60'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 lg:h-80 flex-grow">
        {dataToDisplay.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataToDisplay} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6C757D' }} />
              <YAxis tickFormatter={(value) => `₦${Number(value/1000)}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6C757D' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E9ECEF', borderRadius: '0.5rem' }} 
                formatter={(value: number) => formatNaira(value)} 
              />
              <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
              Icon={LineChart}
              message="No Activity for this Period"
              description="Your progress will appear here once you generate earnings in this timeframe."
          />
        )}
      </div>
    </div>
  );
};

export default MonthlyTargetChart;