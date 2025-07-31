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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            {/* Page Title */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-100 rounded-md"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Content Sections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 w-16 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>          
  );
}
 
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }
      
  if (profileData) {
    const tierImage = `/tiers/${profileData.tier.toLowerCase()}.png`;

    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 sm:gap-12 fade-in">
        {/* Main Content Column */}
        <div className="flex-1 space-y-6 lg:space-y-8 sm:space-y-12">
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
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}