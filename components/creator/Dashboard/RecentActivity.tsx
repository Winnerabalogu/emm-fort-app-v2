import React from 'react';
import ActivityItem from './ActivityItem';
import { Activity, RecentActivityProps, } from  '@/types/Creatortypes/dashboard';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const RecentActivity: React.FC<RecentActivityProps> = ({ activities=[],
  isLoading = false 
}) => {


 const transformActivities = (activities: Activity[])=>{
   return activities.map(Activity => ({
      type: Activity.type,
      message: Activity.description,
      amount: Activity.amount ? `₦${Activity.amount.toFixed(2)}` : '',
      time: formatDistanceToNow(new Date(Activity.timestamp), { addSuffix: true }),
      createdAt: Activity.timestamp
    }));
  };
   const defaultActivities = [
    {
      type: 'earning' as const,
      message: 'Welcome to your creator dashboard',
      amount: '',
      time: 'Just now',
      createdAt: new Date().toISOString()
    },
    {
      type: 'referral' as const,
      message: 'Start sharing your referral code to earn commissions',
      amount: 'Get Started',
      time: 'Welcome tip',
      createdAt: new Date().toISOString()
    }
  ];

  const activityList = activities.length > 0 
    ? transformActivities(activities) 
    : defaultActivities;


  const handleViewAllActivity = (): void => {
    // Handle navigation to full activity page
    console.log('Navigate to full activity page');
  };

if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          {activities.length > 0 && (
            <span className="text-sm text-gray-500">
              {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {activityList.length > 0 ? (
          <>
            <div className="space-y-4">
              {activityList.map((activity, index) => (
                <ActivityItem key={index} recentactivity={activity} />
              ))}
            </div>
            
            {activities.length > 0 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={handleViewAllActivity}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors hover:underline"
                >
                  View All Activity →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</h4>
            <p className="text-sm text-gray-600">
              Start creating content and sharing your referral code to see activity here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;