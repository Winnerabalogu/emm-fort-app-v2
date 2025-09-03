import React from 'react';
import ActivityItem from './ActivityItem';
import { RecentActivityProps, type RecentActivities } from  '@/types/Creatortypes/dashboard';

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const defaultActivities: RecentActivities[] = [
    {
      type: 'earning', message: 'Commission earned from grocery order', amount: '₦125.50', time: '2 hours ago',
      createdAt: ''
    },
    {
      type: 'referral', message: 'New customer signed up with your code', amount: 'SARAH2024', time: '5 hours ago',
      createdAt: ''
    },
    {
      type: 'content', message: 'Posted new unboxing video on Instagram', amount: '15 likes', time: '1 day ago',
      createdAt: ''
    },
    {
      type: 'earning', message: 'Commission earned from bulk order', amount: '₦89.25', time: '2 days ago',
      createdAt: ''
    },
  ];

  const activityList = activities || defaultActivities;

  const handleViewAllActivity = (): void => {
    // Handle navigation to full activity page
    console.log('Navigate to full activity page');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activityList.map((activity, index) => (
            <ActivityItem key={index} recentactivity={activity}/>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button 
            onClick={handleViewAllActivity}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;