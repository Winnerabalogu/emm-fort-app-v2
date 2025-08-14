// components/admin/reports/RevenueByTierChart.tsx
"use client";

import React from 'react';
import { DollarSign, Users, TrendingUp, Crown, Award, Medal, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface TierRevenueData {
  tier: string;
  revenue: number;
  userCount: number;
  averagePerUser: number;
  percentage: number;
}

interface RevenueByTierChartProps {
  data?: TierRevenueData[];
  loading?: boolean;
  period?: string;
}

const RevenueByTierChart: React.FC<RevenueByTierChartProps> = ({ 
  data, 
  loading, 
  period = "Last 3 Months" 
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'PLATINUM': return {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-700',
        accent: 'text-purple-600',
        chartColor: '#8B5CF6'
      };
      case 'GOLD': return {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        accent: 'text-yellow-600',
        chartColor: '#F59E0B'
      };
      case 'SILVER': return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-700',
        accent: 'text-gray-600',
        chartColor: '#6B7280'
      };
      case 'BRONZE': return {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-700',
        accent: 'text-orange-600',
        chartColor: '#EA580C'
      };
      default: return {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-700',
        accent: 'text-blue-600',
        chartColor: '#3B82F6'
      };
    }
  };

  const getTierIcon = (tier: string) => {
    const iconClass = "h-5 w-5";
    switch (tier.toUpperCase()) {
      case 'PLATINUM': return <Crown className={`${iconClass} text-purple-600`} />;
      case 'GOLD': return <Award className={`${iconClass} text-yellow-600`} />;
      case 'SILVER': return <Medal className={`${iconClass} text-gray-600`} />;
      case 'BRONZE': return <Shield className={`${iconClass} text-orange-600`} />;
      default: return <Users className={`${iconClass} text-blue-600`} />;
    }
  };

  // Generate sample data if no real data is provided
  const generateSampleData = (): TierRevenueData[] => {
    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const baseRevenue = [150000, 320000, 580000, 890000]; // Revenue increases with tier
    const userCounts = [45, 28, 18, 9]; // User count decreases with tier
    
    return tiers.map((tier, index) => {
      const revenue = baseRevenue[index];
      const userCount = userCounts[index];
      const averagePerUser = userCount > 0 ? revenue / userCount : 0;
      const totalRevenue = baseRevenue.reduce((sum, val) => sum + val, 0);
      const percentage = (revenue / totalRevenue) * 100;
      
      return {
        tier,
        revenue,
        userCount,
        averagePerUser,
        percentage
      };
    });
  };

  const chartData = data && data.length > 0 ? data : generateSampleData();
  const hasRealData = data && data.length > 0;
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalUsers = chartData.reduce((sum, item) => sum + item.userCount, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          Revenue by Tier ({period})
        </h3>
        {!hasRealData && (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Sample Data
          </span>
        )}
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {chartData.map((tierData) => {
          const colors = getTierColor(tierData.tier);
          return (
            <div 
              key={tierData.tier} 
              className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getTierIcon(tierData.tier)}
                  <span className={`ml-2 font-semibold ${colors.text}`}>
                    {tierData.tier}
                  </span>
                </div>
                <div className={`text-xs font-medium ${colors.accent}`}>
                  {tierData.percentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className={`text-xl font-bold ${colors.text}`}>
                    {formatCurrency(tierData.revenue)}
                  </p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className={`font-semibold ${colors.accent}`}>{tierData.userCount}</p>
                    <p className="text-gray-500">Users</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${colors.accent}`}>
                      {formatCurrency(tierData.averagePerUser)}
                    </p>
                    <p className="text-gray-500">Avg/User</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-700">Revenue Distribution</h4>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-purple-600 rounded-sm"></div>
              <span>Revenue by Tier</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="tier" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
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
                  return [value, name];
                }}
                labelStyle={{ color: '#374151', fontWeight: 'medium' }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTierColor(entry.tier).chartColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-green-600">Total Revenue</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700">
            {totalUsers}
          </div>
          <div className="text-sm text-blue-600">Total Users</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-700">
            {totalUsers > 0 ? formatCurrency(totalRevenue / totalUsers) : formatCurrency(0)}
          </div>
          <div className="text-sm text-purple-600">Avg Revenue/User</div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
          Performance Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Highest Revenue Tier:</span>{' '}
              <span className="text-purple-600 font-semibold">
                {chartData.reduce((max, tier) => tier.revenue > max.revenue ? tier : max).tier}
              </span>
            </p>
            <p className="text-gray-700 mt-1">
              <span className="font-medium">Most Users:</span>{' '}
              <span className="text-blue-600 font-semibold">
                {chartData.reduce((max, tier) => tier.userCount > max.userCount ? tier : max).tier}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Highest Per-User Value:</span>{' '}
              <span className="text-green-600 font-semibold">
                {chartData.reduce((max, tier) => tier.averagePerUser > max.averagePerUser ? tier : max).tier}
              </span>
            </p>
            <p className="text-gray-700 mt-1">
              <span className="font-medium">Revenue Concentration:</span>{' '}
              <span className="text-orange-600 font-semibold">
                {chartData.find(tier => tier.revenue === Math.max(...chartData.map(t => t.revenue)))?.percentage.toFixed(0)}% in top tier
              </span>
            </p>
          </div>
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
                Real tier revenue data will be displayed once your platform has collected sufficient transaction history.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueByTierChart;