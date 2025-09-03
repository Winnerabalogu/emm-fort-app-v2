"use client"
import React from 'react';
import { DollarSign, Share2, Camera, User, LucideIcon } from 'lucide-react';
import { ActivityItemProps, RecentActivities } from  '@/types/Creatortypes/dashboard';

interface ActivityConfig {
  bgColor: string;
  icon: LucideIcon;
  iconColor: string;
  textColor: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ recentactivity }) => {
  const getActivityConfig = (type: RecentActivities['type']): ActivityConfig => {
    switch (type) {
      case 'earning':
        return {
          bgColor: 'bg-green-100',
          icon: DollarSign,
          iconColor: 'text-green-600',
          textColor: 'text-green-600'
        };
      case 'referral':
        return {
          bgColor: 'bg-blue-100',
          icon: Share2,
          iconColor: 'text-blue-600',
          textColor: 'text-blue-600'
        };
      case 'content':
        return {
          bgColor: 'bg-purple-100',
          icon: Camera,
          iconColor: 'text-purple-600',
          textColor: 'text-purple-600'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          icon: User,
          iconColor: 'text-gray-600',
          textColor: 'text-gray-600'
        };
    }
  };

  const config = getActivityConfig(recentactivity.type);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{recentactivity.message}</p>
          <p className="text-xs text-gray-500">{recentactivity.time}</p>
        </div>
      </div>
      <div className={`text-sm font-semibold ${config.textColor}`}>
        {recentactivity.amount}
      </div>
    </div>
  );
};

export default ActivityItem;