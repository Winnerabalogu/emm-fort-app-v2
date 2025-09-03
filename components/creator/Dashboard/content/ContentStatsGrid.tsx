import React from 'react';
import { Camera, Eye, Heart, Sparkles } from 'lucide-react';
import { ContentStatsGridProps } from '@/types/Creatortypes/contentHub';

const ContentStatsGrid: React.FC<ContentStatsGridProps> = ({ stats }) => {
  const statsItems = [
    {
      label: 'Total Posts',
      value: stats.totalPosts.toString(),
      icon: Camera,
      iconColor: 'text-purple-500'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      iconColor: 'text-blue-500'
    },
    {
      label: 'Avg. Engagement',
      value: stats.avgEngagement,
      icon: Heart,
      iconColor: 'text-pink-500'
    },
    {
      label: 'Content Earnings',
      value: stats.contentEarnings,
      icon: Sparkles,
      iconColor: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsItems.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentStatsGrid;