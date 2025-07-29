"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  ArrowRight, 
  Target, 
  Crown,
  Zap,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle2,
  Activity,
  CupSoda
} from 'lucide-react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import Link from 'next/link';
import { Tier } from '@prisma/client';

interface StatsData {
  totalDownlines: number;
  paidDownlines: number;
  totalEarnings: number;
  currentTier: Tier;
  nextUpgradeGoal: {
    targetTier: string;
    needed: number;
  } | null;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  colorClass, 
  bgGradient, 
  subtitle,
  trend 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  bgGradient: string;
  subtitle?: string;
  trend?: string;
}) => (
  <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute inset-0 ${bgGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <Activity className="h-4 w-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// Tier badge component
const TierBadge = ({ tier }: { tier: Tier }) => {
  const tierConfig = {
    BASIC:{ color: 'bg-grey-200 text-amber-800 border-amber-200', icon: CupSoda },
    BRONZE: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Trophy },
    SILVER: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Star },
    GOLD: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Crown },
    PLATINUM: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Zap }
  };
  
  const config = tierConfig[tier] || tierConfig.BRONZE;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}>
      <Icon className="h-4 w-4" />
      {tier.charAt(0) + tier.slice(1).toLowerCase()} Tier
    </div>
  );
};

export default function DownlineStatsTab() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/downline-stats')
      .then(res => {
        if (!res.ok) throw new Error("Failed to load stats.");
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-lg">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Error Loading Stats</h3>
            <p className="text-sm text-red-500">{error || "Could not load stats."}</p>
          </div>
        </div>
      </div>
    );
  }

  const upgradeProgress = stats.nextUpgradeGoal ? (stats.paidDownlines / stats.nextUpgradeGoal.needed) * 100 : 0;
  const conversionRate = stats.totalDownlines > 0 ? ((stats.paidDownlines / stats.totalDownlines) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Downline Analytics</h2>
          <p className="text-gray-600 mt-1">Track your network growth and earnings</p>
        </div>
        <TierBadge tier={stats.currentTier} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Network Size" 
          value={stats.totalDownlines} 
          colorClass="bg-gradient-to-r from-blue-500 to-blue-600" 
          bgGradient="bg-gradient-to-r from-blue-500 to-blue-600"
          subtitle="People in your network"
        />
        <StatCard 
          icon={UserCheck} 
          label="Active Members" 
          value={stats.paidDownlines} 
          colorClass="bg-gradient-to-r from-green-500 to-green-600" 
          bgGradient="bg-gradient-to-r from-green-500 to-green-600"
          subtitle={`${conversionRate}% conversion rate`}
          trend="+12% this month"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Earnings" 
          value={formatNaira(stats.totalEarnings)} 
          colorClass="bg-gradient-to-r from-orange-500 to-orange-600" 
          bgGradient="bg-gradient-to-r from-orange-500 to-orange-600"
          subtitle="Lifetime commissions"
          trend="+5.2% this week"
        />
      </div>

      {/* Upgrade Goal Section */}
      {stats.nextUpgradeGoal ? (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Next Tier Goal</h3>
                <p className="text-sm text-gray-600">
                  Upgrade to <span className="font-bold capitalize text-purple-600">
                    {stats.nextUpgradeGoal.targetTier.toLowerCase()}
                  </span> tier
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">
                  {stats.paidDownlines} / {stats.nextUpgradeGoal.needed} <span className='mr-8'>members</span> 
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${Math.min(upgradeProgress, 100)}%` }}
                  />
                </div>
                <div className="absolute -top-8 right-0 text-xs font-medium text-purple-600">
                  {Math.round(upgradeProgress)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{stats.paidDownlines} active members</span>
                </div>
                <div className="text-sm font-medium text-purple-600">
                  {stats.nextUpgradeGoal.needed - stats.paidDownlines} more needed
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Crown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maximum Tier Achieved!</h3>
              <p className="text-sm text-gray-600">
                Congratulations! You&apos;ve reached the highest tier available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/downlines" 
            className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Manage Network</p>
              <p className="text-sm text-gray-600">View and manage your downlines</p>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/dashboard/referrals" 
            className="group flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Invite More</p>
              <p className="text-sm text-gray-600">Share your referral link</p>
            </div>
            <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalEarnings > 0 ? formatNaira(stats.totalEarnings / stats.paidDownlines) : formatNaira(0)}
            </div>
            <div className="text-sm text-gray-600">Avg. per Member</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">
              {stats.currentTier}
            </div>
            <div className="text-sm text-gray-600">Current Tier</div>
          </div>
        </div>
      </div>
    </div>
  );
}