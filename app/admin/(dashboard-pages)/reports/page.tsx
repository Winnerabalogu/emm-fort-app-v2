"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Download,   
  Filter,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/admin/common/StatsCard';
import UserTierChart from '@/components/admin/reports/UserTierChart';
import MonthlyGrowthChart from '@/components/admin/reports/MonthlyGrowthChart';

interface ReportData {
  userStats: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    usersByTier: Array<{
      tier: string;
      count: number;
      percentage: number;
    }>;
  };
  financialStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalCommissions: number;
    averageCommissionPerUser: number;
    topEarners: Array<{
      id: string;
      fullName: string;
      username: string;
      tier: string;
      totalEarnings: number;
    }>;
  };
  transactionStats: {
    totalTransactions: number;
    transactionsThisMonth: number;
    transactionsByType: Array<{
      type: string;
      count: number;
      amount: number;
    }>;
    transactionsByStatus: Array<{
      status: string;
      count: number;
      amount: number;
    }>;
  };
  withdrawalStats: {
    totalWithdrawals: number;
    pendingWithdrawals: number;
    totalWithdrawnAmount: number;
    averageWithdrawalAmount: number;
  };
  growthMetrics: {
    userGrowthPercentage: number;
    revenueGrowthPercentage: number;
    monthlyGrowthData: Array<{
      month: string;
      users: number;
      revenue: number;
      transactions: number;
    }>;
  };
} 

interface DateRange {
  from: string;
  to: string;
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<'overview' | 'users' | 'financial' | 'transactions'>('overview');

  const fetchReportData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        type: reportType
      });

      const response = await fetch(`/api/admin/report?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports');
      }

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        if (showToast) {
          toast.success('Reports updated successfully');
        }
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [dateRange, reportType]);

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        type: reportType,
        format
      });

      const response = await fetch(`/api/admin/report/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${dateRange.from}-to-${dateRange.to}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    fetchReportData(true);
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-500">
            Comprehensive insights into your platform performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReportData(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleExportReport('csv')}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Report Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'overview' | 'users' | 'financial' | 'transactions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="overview">Overview</option>
              <option value="users">User Analytics</option>
              <option value="financial">Financial Report</option>
              <option value="transactions">Transaction Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : reportData ? (
          <>
            <StatsCard
              title="Total Users"
              value={reportData.userStats?.totalUsers ?? 0}
              subtitle={`+${reportData.userStats?.newUsersThisMonth ?? 0} this month`}
              icon={Users}
              color="blue"
              trend={reportData.growthMetrics?.userGrowthPercentage ? {
                value: reportData.growthMetrics.userGrowthPercentage,
                isPositive: reportData.growthMetrics.userGrowthPercentage >= 0
              } : undefined}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(reportData.financialStats?.totalRevenue ?? 0)}
              subtitle={`${formatCurrency(reportData.financialStats?.monthlyRevenue ?? 0)} this month`}
              icon={DollarSign}
              color="green"
              trend={reportData.growthMetrics?.revenueGrowthPercentage ? {
                value: reportData.growthMetrics.revenueGrowthPercentage,
                isPositive: reportData.growthMetrics.revenueGrowthPercentage >= 0
              } : undefined}
            />
            <StatsCard
              title="Total Transactions"
              value={reportData.transactionStats?.totalTransactions ?? 0}
              subtitle={`${reportData.transactionStats?.transactionsThisMonth ?? 0} this month`}
              icon={Activity}
              color="purple"
            />
            <StatsCard
              title="Pending Withdrawals"
              value={reportData.withdrawalStats?.pendingWithdrawals ?? 0}
              subtitle={`${formatCurrency(reportData.withdrawalStats?.totalWithdrawnAmount ?? 0)} total withdrawn`}
              icon={TrendingUp}
              color="orange"
            />
          </>
        ) : null}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* User Distribution by Tier */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Users by Tier
                </h3>
              </div>
              <UserTierChart 
                data={reportData?.userStats?.usersByTier || []}
                loading={loading}
              />
            </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : reportData?.userStats?.usersByTier ? (
            <div className="space-y-4">
              {reportData.userStats.usersByTier.map((tier, index) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ 
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] || '#6B7280'
                      }}
                    />
                    <span className="font-medium text-gray-700">{tier.tier}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{tier.count}</div>
                    <div className="text-sm text-gray-500">{tier.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Transaction Types */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaction Types
            </h3>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : reportData?.transactionStats?.transactionsByType ? (
            <div className="space-y-4">
              {reportData.transactionStats.transactionsByType.map((transaction, index) => (
                <div key={transaction.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ 
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] || '#6B7280'
                      }}
                    />
                    <span className="font-medium text-gray-700 capitalize">
                      {transaction.type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{transaction.count}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(transaction.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Top Earners */}
      {reportData?.financialStats?.topEarners && reportData.financialStats.topEarners.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Earners
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.financialStats.topEarners.map((earner, index) => (
                  <tr key={earner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{earner.fullName}</div>
                          <div className="text-sm text-gray-500">@{earner.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        {earner.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(earner.totalEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

     {/* Monthly Growth Chart */}
<div className="bg-white p-6 rounded-lg border">
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <LineChart className="h-5 w-5" />
      Monthly Growth Trends
    </h3>
  </div>
  <MonthlyGrowthChart 
    growthMetrics={reportData?.growthMetrics || {
      userGrowthPercentage: 0,
      revenueGrowthPercentage: 0,
      monthlyGrowthData: []
    }}
    loading={loading}
    dateRange={{ from: dateRange.from, to: dateRange.to }}
  />
</div>
    </div>
  );
}