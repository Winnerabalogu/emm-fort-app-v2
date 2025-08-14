// components/admin/reports/MonthlyGrowthChart.tsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlyGrowthData {
  month: string;
  users: number;
  revenue: number;
  transactions: number;
}

interface GrowthMetrics {
  userGrowthPercentage: number;
  revenueGrowthPercentage: number;
  monthlyGrowthData: MonthlyGrowthData[];
}

interface MonthlyGrowthChartProps {
  growthMetrics: GrowthMetrics;
  loading?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

const MonthlyGrowthChart: React.FC<MonthlyGrowthChartProps> = ({ 
  growthMetrics, 
  loading,
  dateRange 
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }
    return `₦${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Generate mock data for the last 12 months if no real data is available
  const generateMockData = (): MonthlyGrowthData[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      // Generate realistic mock data with growth trends
      const baseUsers = 100;
      const baseRevenue = 50000;
      const baseTransactions = 200;
      
      const growth = Math.pow(1.1, 11 - i); // 10% monthly growth
      const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation
      
      months.push({
        month: monthName,
        users: Math.round(baseUsers * growth * randomVariation),
        revenue: Math.round(baseRevenue * growth * randomVariation),
        transactions: Math.round(baseTransactions * growth * randomVariation)
      });
    }
    
    return months;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const chartData = growthMetrics.monthlyGrowthData.length > 0 
    ? growthMetrics.monthlyGrowthData 
    : generateMockData();

  const hasRealData = growthMetrics.monthlyGrowthData.length > 0;

  // Calculate trend indicators
  const getGrowthIndicator = (percentage: number) => {
    const isPositive = percentage >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const bgColorClass = isPositive ? 'bg-green-50' : 'bg-red-50';
    
    return {
      Icon,
      colorClass,
      bgColorClass,
      text: `${isPositive ? '+' : ''}${percentage.toFixed(1)}%`
    };
  };

  const userGrowth = getGrowthIndicator(growthMetrics.userGrowthPercentage);
  const revenueGrowth = getGrowthIndicator(growthMetrics.revenueGrowthPercentage);

  return (
    <div className="space-y-6">
      {/* Growth Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* User Growth */}
        <div className={`p-4 rounded-lg border-2 ${userGrowth.bgColorClass} border-opacity-20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">User Growth</span>
            </div>
            <div className={`flex items-center space-x-1 ${userGrowth.colorClass}`}>
              <userGrowth.Icon className="h-4 w-4" />
              <span className="text-sm font-semibold">{userGrowth.text}</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">vs previous period</p>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className={`p-4 rounded-lg border-2 ${revenueGrowth.bgColorClass} border-opacity-20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Revenue Growth</span>
            </div>
            <div className={`flex items-center space-x-1 ${revenueGrowth.colorClass}`}>
              <revenueGrowth.Icon className="h-4 w-4" />
              <span className="text-sm font-semibold">{revenueGrowth.text}</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">vs previous period</p>
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="p-4 rounded-lg border-2 bg-blue-50 border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Activity Level</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Platform engagement</p>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-800">Trends Over Time</h4>
          {!hasRealData && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Sample Data
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Users</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Revenue</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Transactions</span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [formatCurrency(value), 'Revenue'];
                }
                return [formatNumber(value), name === 'users' ? 'Users' : 'Transactions'];
              }}
              labelStyle={{ color: '#374151', fontWeight: 'medium' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="users" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="transactions" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatNumber(chartData.reduce((sum, d) => sum + d.users, 0))}
          </div>
          <div className="text-xs text-gray-500">Total New Users</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0))}
          </div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {formatNumber(chartData.reduce((sum, d) => sum + d.transactions, 0))}
          </div>
          <div className="text-xs text-gray-500">Total Transactions</div>
        </div>
      </div>

      {!hasRealData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Sample Data Display</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This chart is currently showing sample data for demonstration purposes. 
                Real monthly growth data will be displayed as your platform collects historical metrics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyGrowthChart;