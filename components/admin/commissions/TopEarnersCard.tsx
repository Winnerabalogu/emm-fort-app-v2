"use client";

import { Crown, TrendingUp, User } from 'lucide-react';
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
      case 'PLATINUM': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'SILVER': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'BRONZE': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md';
      case 1: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-md';
      case 2: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center text-white">
          <Crown className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">Top Earners</h3>
        </div>
        <p className="text-orange-100 text-sm mt-1">This month&apos;s leading performers</p>
      </div>
      
      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="space-y-3 lg:space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : topEarners.length > 0 ? (
            topEarners.map((earner, index) => (
              <div 
                key={earner.user?.id || index} 
                className="group relative bg-gray-50 rounded-xl p-4 lg:p-5 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side - Rank and User Info */}
                  <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-base font-bold flex-shrink-0 ${getRankColor(index)}`}>
                      {index + 1}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2 lg:mb-3">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                          {earner.user?.fullName || 'Unknown User'}
                        </h4>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                        <p className="text-xs lg:text-sm text-gray-500 truncate">
                          @{earner.user?.username}
                        </p>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border self-start lg:self-auto ${getTierColor(earner.user?.tier || 'BASIC')}`}>
                          {earner.user?.tier || 'BASIC'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center justify-end mb-1 lg:mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1 lg:mr-2" />
                      <span className="font-bold text-base lg:text-lg text-gray-900">
                        {formatCurrency(earner.totalCommissions)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {earner.transactionCount} {earner.transactionCount === 1 ? 'transaction' : 'transactions'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Top 3 special indicator */}
                {index < 3 && (
                  <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-400'
                    }`}></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 lg:py-12">
              <TrendingUp className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">No Data Available</h4>
              <p className="text-gray-500 text-sm lg:text-base max-w-md mx-auto">
                Commission data will appear here once transactions are recorded.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!loading && topEarners.length > 0 && (
          <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
            <p className="text-xs lg:text-sm text-gray-500 text-center">
              Rankings based on total commissions earned this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
}