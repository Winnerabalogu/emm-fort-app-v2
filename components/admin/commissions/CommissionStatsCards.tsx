// components/admin/commissions/CommissionStatsCards.tsx
"use client";

import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CommissionStats {
  totalCommissions: number;
  totalCount: number;
  topEarners: Array<{
    user: {
      id: string;
      fullName: string;
      username: string;
      tier: string;
    } | null;
    totalCommissions: number;
    transactionCount: number;
  }>;
  typeBreakdown: Record<string, { count: number; amount: number }>;
}

interface CommissionStatsCardsProps {
  stats: CommissionStats | null;
  loading: boolean;
}

export function CommissionStatsCards({ stats, loading }: CommissionStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const commissionAmount = stats.typeBreakdown.COMMISSION?.amount || 0;
  const bonusAmount = stats.typeBreakdown.BONUS?.amount || 0;
  const topEarner = stats.topEarners[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Total Commissions</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalCommissions)}</p>
            <p className="text-xs text-gray-500">{stats.totalCount} transactions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Direct Commissions</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(commissionAmount)}</p>
            <p className="text-xs text-gray-500">{stats.typeBreakdown.COMMISSION?.count || 0} payments</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <Award className="h-8 w-8 text-purple-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Bonuses</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(bonusAmount)}</p>
            <p className="text-xs text-gray-500">{stats.typeBreakdown.BONUS?.count || 0} payments</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-orange-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Top Earner</p>
            <p className="text-sm font-bold text-gray-900">
              {topEarner?.user?.fullName || 'No data'}
            </p>
            <p className="text-xs text-gray-500">
              {topEarner ? formatCurrency(topEarner.totalCommissions) : '₦0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



