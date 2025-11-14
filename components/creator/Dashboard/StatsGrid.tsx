import React from 'react'
import { DollarSign, Share2, Camera, TrendingUp, ShoppingBag, Users } from 'lucide-react'
import StatCard from './StatCard'
import { StatsGridProps, StatCardProps } from '@/types/Creatortypes/dashboard'

const StatsGrid: React.FC<StatsGridProps> = ({ user, stats, dailyEarnings }) => {
  const earningsGrowth = stats.earningsGrowth || 0

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
      title: "Affiliate Commissions",
      value: `₦${stats.affiliateEarnings?.toLocaleString() || '0'}`,
      icon: Users,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitle: `${stats.affiliateCommissionCount || 0} tier subscriptions`,
      subtitleColor: "text-blue-600"
    },
    {
      title: "Creator Commissions",
      value: `₦${stats.creatorEarnings?.toLocaleString() || '0'}`,
      icon: ShoppingBag,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      subtitle: `${stats.creatorCommissionCount || 0} grocery orders`,
      subtitleColor: "text-purple-600"
    },
    {
      title: "Pending Payment",
      value: `₦${user.pendingPayment.toLocaleString()}`,
      icon: DollarSign,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      subtitle: "Next payout in 5 days",
      subtitleColor: "text-orange-600"
    }
  ]

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Earnings Breakdown Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earnings Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Affiliate Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Affiliate Program
              </span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              ₦{stats.affiliateEarnings?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              From {stats.affiliateCommissionCount || 0} tier subscription referrals
            </p>
          </div>

          {/* Creator Section */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">
                Creator Sales
              </span>
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              ₦{stats.creatorEarnings?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              From {stats.creatorCommissionCount || 0} grocery product sales
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      {dailyEarnings && dailyEarnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Earnings Trend (Last 30 Days)
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-end space-x-1 overflow-x-auto">
            {dailyEarnings.map((day, index) => {
              const maxEarnings = Math.max(...dailyEarnings.map(d => d.earnings))
              const height = maxEarnings > 0 
                ? Math.max((day.earnings / maxEarnings) * 200, 2) 
                : 2
              
              return (
                <div key={index} className="flex-1 min-w-[20px] flex flex-col items-center group">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm hover:from-orange-600 hover:to-orange-500 transition-colors cursor-pointer relative"
                    style={{ height: `${height}px` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.date}: ₦{day.earnings.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left whitespace-nowrap">
                    {day.date}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>Combined earnings from affiliate & creator programs</span>
            <span className="text-gray-900 font-semibold">
              Total: ₦{dailyEarnings.reduce((sum, day) => sum + day.earnings, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default StatsGrid