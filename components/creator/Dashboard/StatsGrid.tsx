// components/creator/Dashboard/StatsGrid.tsx
import React from 'react';
import { DollarSign, Share2, Camera, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { StatsGridProps, StatCardProps } from '@/types/Creatortypes/dashboard';

const StatsGrid: React.FC<StatsGridProps> = ({ user, stats, dailyEarnings }) => {
  // Calculate growth indicators
  const earningsGrowth = stats.earningsGrowth || 0;
  const thisWeekReferrals = stats.thisWeekReferrals || 0;
  const thisWeekContentPosts = stats.thisWeekContentPosts || 0;

  const statsCards: StatCardProps[] = [
    {
      title: "Total Earnings",
      value: `₦${user.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      subtitle: `₦${user.thisMonthEarnings.toLocaleString()} this month`,
      subtitleColor: earningsGrowth >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Pending Payment",
      value: `₦${user.pendingPayment.toLocaleString()}`,
      icon: DollarSign,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      subtitle: "Next payout in 5 days",
      subtitleColor: "text-orange-600"
    },
    {
      title: "Total Referrals",
      value: user.totalReferrals.toString(),
      icon: Share2,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitle: `+${thisWeekReferrals} this week`,
      subtitleColor: "text-blue-600"
    },
    {
      title: "Content Posts",
      value: user.contentPosts.toString(),
      icon: Camera,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      subtitle: `${thisWeekContentPosts} posts this week`,
      subtitleColor: "text-purple-600"
    }
  ];

  return (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Earnings Chart Card - if dailyEarnings data is available */}
      {dailyEarnings && dailyEarnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Earnings Trend (Last 30 Days)</h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-end space-x-1 overflow-x-auto">
            {dailyEarnings.map((day, index) => {
              const maxEarnings = Math.max(...dailyEarnings.map(d => d.earnings));
              const height = maxEarnings > 0 ? Math.max((day.earnings / maxEarnings) * 200, 2) : 2;
              
              return (
                <div key={index} className="flex-1 min-w-[20px] flex flex-col items-center group">
                  <div 
                    className="w-full bg-orange-500 rounded-t-sm hover:bg-orange-600 transition-colors cursor-pointer relative"
                    style={{ height: `${height}px` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.date}: ₦{day.earnings.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left whitespace-nowrap">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>Daily earnings overview</span>
            <div className="flex items-center space-x-4">
              <span className={`font-medium ${earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {earningsGrowth >= 0 ? '↗' : '↘'} {Math.abs(earningsGrowth).toFixed(1)}% trend
              </span>
              <span className="text-gray-500">
                Total: ₦{dailyEarnings.reduce((sum, day) => sum + day.earnings, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatsGrid;