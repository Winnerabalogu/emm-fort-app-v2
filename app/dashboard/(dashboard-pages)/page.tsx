"use client";
import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { UserProfile } from '@/lib/types';

import TierCard from '@/components/dashboard/index/TierCard';
import BalanceCard from '@/components/dashboard/index/BalanceCard';
import MonthlyTargetChart from '@/components/dashboard/index/MonthlyTargetChart';
import RightSidebar from '@/components/dashboard/index/RightSidebar';


function DashboardContent() {
  const { status } = useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    
    if (status === 'authenticated') {
      const fetchDashboardData = async () => {        
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch user data');
          }
          const data: UserProfile = await response.json();
          setProfileData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      };
      fetchDashboardData();
    }
  }, [status]);
  
  
  
  if (status === 'loading' || !profileData && !error) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main Content Column */}
      <div className="flex-1 space-y-6 lg:space-y-8">
        {/* Tier Card Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="animate-pulse flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-100 rounded w-48"></div>
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-40"></div>
            </div>
          </div>
        </div>

        {/* Balance Card Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-100 rounded w-64"></div>
            </div>
            {/* Chart area */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-between p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div 
                  key={i} 
                  className="bg-gray-200 rounded-t"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`, 
                    width: '6%' 
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Earnings Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Downlines Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-100 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-100 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-100 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }
      
  if (profileData) {
    const tierImage = `/tiers/${profileData.tier.toLowerCase()}.png`;

    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 fade-in">
        {/* Main Content Column */}
        <div className="flex-1 space-y-6 lg:space-y-8 sm:p-8">
          <TierCard tier={profileData.tier} imageUrl={tierImage} />
          <BalanceCard balance={profileData.balance} />
          <MonthlyTargetChart chartData={profileData.monthlyTarget.history} />
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar 
          totalEarned={profileData.totalEarned} 
          quarterlyTarget={profileData.monthlyTarget.target}
          downlines={profileData.downlines}
          transactions={profileData.transactions}
        />
      </div>
    );
  }
  
  
  return (    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
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

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}