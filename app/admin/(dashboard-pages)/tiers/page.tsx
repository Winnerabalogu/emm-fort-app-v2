"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Crown, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Shield,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import RevenueByTierChart from '@/components/admin/reports/RevenueByTierChart';

interface TierDistribution {
  [key: string]: number;
}

interface RecentUpgrade {
  id: string;
  fullName: string;
  username: string;
  email: string;
  tier: string;
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
}

interface TierStats {
  tierDistribution: TierDistribution;
  recentUpgrades: RecentUpgrade[];
  activeSubscriptions: number;
  tierRevenue: Record<string, number>;
}

interface TierConfig {
  name: string;
  price: string;
  primaryCommission: string;
  secondaryCommission: string;
  features: string[];
}

export default function AdminTierManagementPage() {
  const [stats, setStats] = useState<TierStats | null>(null);
  const [tierConfig, setTierConfig] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTierData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      
      const [summaryResponse, configResponse] = await Promise.all([
        fetch('/api/admin/tiers?summary=true'),
        fetch('/api/admin/tiers')
      ]);

      if (!summaryResponse.ok || !configResponse.ok) {
        throw new Error('Failed to fetch tier data');
      }

      const [summaryResult, configResult] = await Promise.all([
        summaryResponse.json(),
        configResponse.json()
      ]);

      if (summaryResult.success) {
        setStats(summaryResult.data);
      }
      
      if (configResult.success) {
        setTierConfig(configResult.data.tiers);
      }

      if (showToast) {
        toast.success('Tier data updated');
      }
    } catch (error) {
      console.error('Fetch tier data error:', error);
      toast.error('Failed to load tier data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTierData();
  }, [fetchTierData]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'SILVER': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'BRONZE': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'BASIC': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return <Crown className="h-5 w-5" />;
      case 'GOLD': return <Award className="h-5 w-5" />;
      case 'SILVER': return <Shield className="h-5 w-5" />;
      case 'BRONZE': return <Users className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tier Management</h1>
          <p className="text-sm text-gray-500">Manage subscription tiers and user upgrades</p>
        </div>
        <button
          onClick={() => fetchTierData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                  <p className="text-xs text-gray-500">Currently active</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Revenue (3M)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(Object.values(stats.tierRevenue).reduce((sum, rev) => sum + rev, 0))}
                  </p>
                  <p className="text-xs text-gray-500">Last 3 months</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Recent Upgrades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentUpgrades.length}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Tier Distribution & Configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Tier Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Crown className="h-5 w-5 text-orange-600 mr-2" />
            Tier Distribution
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats?.tierDistribution || {}).map(([tier, count]) => {
                const totalUsers = Object.values(stats?.tierDistribution || {}).reduce((sum, c) => sum + c, 0);
                const percentage = totalUsers > 0 ? (count / totalUsers * 100).toFixed(1) : '0';
                const revenue = stats?.tierRevenue[tier] || 0;
                
                return (
                  <div key={tier} className={`p-4 rounded-lg border ${getTierColor(tier)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getTierIcon(tier)}
                        <div className="ml-3">
                          <h4 className="font-semibold">{tier}</h4>
                          <p className="text-sm opacity-75">{count} users ({percentage}%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(revenue)}</p>
                        <p className="text-xs opacity-75">3M revenue</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tier Configuration */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="h-5 w-5 text-orange-600 mr-2" />
            Tier Configuration
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tierConfig.map((tier) => (
                <div key={tier.name} className={`p-4 rounded-lg border ${getTierColor(tier.name)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {getTierIcon(tier.name)}
                      <div className="ml-3">
                        <h4 className="font-semibold">{tier.name}</h4>
                        <p className="text-sm opacity-75">{tier.price}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">Commissions</p>
                      <p className="opacity-75">1°: {tier.primaryCommission}</p>
                      <p className="opacity-75">2°: {tier.secondaryCommission}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Upgrades */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Recent Tier Upgrades (Last 30 Days)
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </div>
        ) : stats?.recentUpgrades.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentUpgrades.map((upgrade) => {
                  const isActive = upgrade.subscriptionExpiryDate && new Date(upgrade.subscriptionExpiryDate) > new Date();
                  
                  return (
                    <tr key={upgrade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{upgrade.fullName}</div>
                            <div className="text-sm text-gray-500">@{upgrade.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg ${getTierColor(upgrade.tier)}`}>
                          {getTierIcon(upgrade.tier)}
                          <span className="ml-2">{upgrade.tier}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(upgrade.subscriptionStartDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(upgrade.subscriptionExpiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                        }`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent upgrades</h3>
            <p className="text-gray-500">No tier upgrades in the last 30 days</p>
          </div>
        )}
      </div>

      {/* Revenue by Tier Chart */}
     {stats && (
  <div className="bg-white p-6 rounded-lg border">
    <RevenueByTierChart 
      data={Object.entries(stats.tierRevenue).map(([tier, revenue]) => ({
        tier,
        revenue,
        userCount: stats.tierDistribution[tier] || 0,
        averagePerUser: stats.tierDistribution[tier] > 0 ? revenue / stats.tierDistribution[tier] : 0,
        percentage: Object.values(stats.tierRevenue).reduce((sum, val) => sum + val, 0) > 0 
          ? (revenue / Object.values(stats.tierRevenue).reduce((sum, val) => sum + val, 0)) * 100 
          : 0
      }))}
      loading={loading}
      period="Last 3 Months"
    />
  </div>
)}
    </div>
  );
}