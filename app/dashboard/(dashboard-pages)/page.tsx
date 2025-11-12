"use client";
import { useState, useEffect, Suspense } from 'react';
import DashboardSwitcher from '@/components/DashboardSwitcher';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/lib/types';
import dynamic from 'next/dynamic';

// Lazy load components to reduce initial bundle size
const TierCard = dynamic(() => import('@/components/dashboard/index/TierCard'), {
  loading: () => <TierCardSkeleton />
});
const BalanceCard = dynamic(() => import('@/components/dashboard/index/BalanceCard'), {
  loading: () => <BalanceCardSkeleton />
});
const MonthlyTargetChart = dynamic(() => import('@/components/dashboard/index/MonthlyTargetChart'), {
  loading: () => <ChartSkeleton />
});
const RightSidebar = dynamic(() => import('@/components/dashboard/index/RightSidebar'), {
  loading: () => <SidebarSkeleton />
});

// Individual skeleton components for better UX
function TierCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse flex items-center gap-4">
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-100 rounded w-48"></div>
        </div>
      </div>
    </div>
  );
}

function BalanceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-12 bg-gray-200 rounded w-40"></div>
        <div className="h-4 bg-gray-100 rounded w-32"></div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="w-full lg:w-80 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main dashboard loader
function DashboardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="flex-1 space-y-6 lg:space-y-8">
        <TierCardSkeleton />
        <BalanceCardSkeleton />
        <ChartSkeleton />
      </div>
      <SidebarSkeleton />
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {    
    if (status === 'authenticated') {
      const fetchDashboardData = async () => {        
        try {
          setIsLoading(true);                    
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); 
          
          const response = await fetch('/api/dashboard', {
            signal: controller.signal,            
            cache: 'no-store', 
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch user data');
          }
          
          const data: UserProfile = await response.json();
          
          setProfileData(data);
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setError('Request timed out. Please try again.');
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
        }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);
  
  // Show skeleton while loading
  if (status === 'loading' || isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Error loading dashboard</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
      
  if (!profileData) {
    return <DashboardSkeleton />;
  }

  const tierImage = `/tiers/${profileData.tier.toLowerCase()}.png`;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 fade-in">
    
      {/* Main Content Column */}
      <div className="flex-1 space-y-6 lg:space-y-8">
            <DashboardSwitcher />
        <Suspense fallback={<TierCardSkeleton />}>
          <TierCard tier={profileData.tier} imageUrl={tierImage} />
        </Suspense>
        
        <Suspense fallback={<BalanceCardSkeleton />}>
          <BalanceCard balance={profileData.balance} />
        </Suspense>
        
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyTargetChart chartData={profileData.monthlyTarget.history} />
        </Suspense>
      </div>
      
      {/* Right Sidebar */}
      <Suspense fallback={<SidebarSkeleton />}>
        <RightSidebar 
          totalEarned={profileData.totalEarned} 
          quarterlyTarget={profileData.monthlyTarget.target}
          downlines={profileData.downlines}
          transactions={profileData.transactions}
        />
      </Suspense>
    </div>
  );
}