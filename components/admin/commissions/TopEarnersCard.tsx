// components/admin/commissions/TopEarnersCard.tsx
"use client";

import { Crown, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TopEarner {
  user: {
    id: string;
    fullName: string;
    username: string;
    tier: string;
  } | null;
  totalCommissions: number;
  transactionCount: number;
}

interface TopEarnersCardProps {
  topEarners: TopEarner[];
  loading: boolean;
}

export function TopEarnersCard({ topEarners, loading }: TopEarnersCardProps) {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'text-purple-700 bg-purple-100';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100';
      case 'SILVER': return 'text-gray-700 bg-gray-100';
      case 'BRONZE': return 'text-orange-700 bg-orange-100';
      default: return 'text-blue-700 bg-blue-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center mb-4">
        <Crown className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Top Earners This Month</h3>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))
        ) : topEarners.length > 0 ? (
          topEarners.map((earner, index) => (
            <div key={earner.user?.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{earner.user?.fullName || 'Unknown User'}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">@{earner.user?.username}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(earner.user?.tier || 'BASIC')}`}>
                      {earner.user?.tier || 'BASIC'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <TrendingUp className="h-5 w-5 text-green-600 inline-block" />
                <p className="font-semibold text-gray-900">{formatCurrency(earner.totalCommissions)}</p>
                <p className="text-xs text-gray-500">{earner.transactionCount} transactions</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No commission data available</p>
        )}
      </div>
    </div>
  );
}