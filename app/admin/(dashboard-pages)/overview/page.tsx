"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  RefreshCw,
  AlertCircle,
  Calendar
} from 'lucide-react';
import StatsCard from '@/components/admin/common/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  tier: string;
}

interface PendingWithdrawal {
  id: string;
  amount: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    fullName: string;
    username: string;
  };
}

interface StatsData {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  monthlyRevenue: number;
  transactionsToday: number;
  newUsersToday: number;
  recentUsers: RecentUser[];
  pendingWithdrawalRequests: PendingWithdrawal[];
  recentTransactions: RecentTransaction[];
  userGrowthPercentage: number;
  revenueGrowthPercentage: number;
}

interface ApiResponse {
  success: boolean;
  data: StatsData;
  error?: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/stats', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
        setLastUpdated(new Date());
        if (showToast) {
          toast.success('Dashboard updated successfully');
        }
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Dashboard stats error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGrowthPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getGrowthColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'commission':
      case 'sale_commission':
        return 'text-green-600 bg-green-50';
      case 'bonus':
        return 'text-blue-600 bg-blue-50';
      case 'manual_adjustment':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (error && !stats) {
    return (      
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load dashboard</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>      
    );
  }

  return (    
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time insights into your affiliate platform performance
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : (
            <>
              <StatsCard 
                title="Total Users" 
                value={stats?.totalUsers ?? 0}
                subtitle={`+${stats?.newUsersToday ?? 0} today`}
                icon={Users} 
                color="blue"
                trend={stats?.userGrowthPercentage ? {
                  value: stats.userGrowthPercentage,
                  isPositive: stats.userGrowthPercentage >= 0
                } : undefined}
              />
              <StatsCard 
                title="Active Subscribers" 
                value={stats?.activeSubscribers ?? 0}
                subtitle={`${((stats?.activeSubscribers ?? 0) / (stats?.totalUsers ?? 1) * 100).toFixed(1)}% of total`}
                icon={UserCheck} 
                color="purple" 
              />
              <StatsCard 
                title="Total Revenue" 
                value={formatCurrency(stats?.totalRevenue ?? 0)}
                subtitle={`₦${(stats?.monthlyRevenue ?? 0).toLocaleString()} this month`}
                icon={DollarSign} 
                color="green"
                trend={stats?.revenueGrowthPercentage ? {
                  value: stats.revenueGrowthPercentage,
                  isPositive: stats.revenueGrowthPercentage >= 0
                } : undefined}
              />
              <StatsCard 
                title="Pending Withdrawals" 
                value={stats?.pendingWithdrawals ?? 0}
                subtitle="Require attention"
                icon={Clock} 
                color="orange" 
              />
            </>
          )}
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.monthlyRevenue ?? 0)}</p>
                    {stats?.revenueGrowthPercentage !== undefined && (
                      <p className={`text-sm ${getGrowthColor(stats.revenueGrowthPercentage)}`}>
                        {formatGrowthPercentage(stats.revenueGrowthPercentage)} from last month
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Transactions Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.transactionsToday ?? 0}</p>
                    <p className="text-sm text-gray-500">All transaction types</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Sign-ups */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Sign-ups</h3>
              <Link href="/admin/users" className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : stats?.recentUsers.length ? (
                stats.recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        {user.tier}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent sign-ups</p>
              )}
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Pending Withdrawals</h3>
              <Link href="/admin/withdrawals" className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : stats?.pendingWithdrawalRequests.length ? (
                stats.pendingWithdrawalRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{req.user.fullName}</p>
                      <p className="text-sm text-gray-500">@{req.user.username}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-700">{formatCurrency(req.amount)}</p>
                      <p className="text-xs text-gray-400">{formatDate(req.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No pending withdrawals</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <Link href="/admin/transactions" className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : stats?.recentTransactions?.length ? (
                stats.recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{transaction.user.fullName}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent transactions</p>
              )}
            </div>
          </div>

        </div>
      </div>    
  );
}