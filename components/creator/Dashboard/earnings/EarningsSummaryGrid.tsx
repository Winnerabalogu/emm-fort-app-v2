
"use client"
import React from 'react';
import { DollarSign, Calendar, Clock, ShoppingCart, TrendingUp, Eye, Users } from 'lucide-react';
import EarningsSummaryCard from './EarningsSummaryCard';
import { EarningsSummaryGridProps } from '@/types/Creatortypes/earnings';

const EarningsSummaryGrid: React.FC<EarningsSummaryGridProps> = ({ summary }) => {
  const formatCurrency = (amount: number): string => 
    `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(summary.totalEarnings),
      icon: DollarSign,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      subtitle: `+${summary.monthlyGrowth}% from last month`,
      subtitleIcon: TrendingUp,
      subtitleColor: 'text-green-600',
      trend: 'up' as const,
      trendValue: `+${summary.monthlyGrowth}% growth`
    },
    {
      title: 'This Week',
      value: formatCurrency(summary.thisWeekEarnings),
      icon: Calendar,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subtitle: `${summary.totalOrders} orders this week`,
      subtitleIcon: TrendingUp,
      subtitleColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: formatCurrency(summary.pendingEarnings),
      icon: Clock,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      subtitle: 'Awaiting confirmation',
      subtitleIcon: Eye,
      subtitleColor: 'text-orange-600'
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(summary.averageOrderValue),
      icon: ShoppingCart,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitle: `From ${summary.totalCustomers} customers`,
      subtitleIcon: Users,
      subtitleColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <EarningsSummaryCard key={index} {...card} />
      ))}
    </div>
  );
};

export default EarningsSummaryGrid;