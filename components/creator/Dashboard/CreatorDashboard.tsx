// app/creator/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { StatsGrid, QuickActions, RecentActivity } from '@/components/creator/Dashboard';
import { User, DashboardData } from '@/types/Creatortypes/dashboard';
import { DashboardSkeleton } from './Skeletons';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data from your API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/creator/dashboard');
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/creator/auth/login';
            return;
          }
          if (response.status === 403) {
            window.location.href = '/';
            return;
          }
          throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        
        // Transform API data to match your User interface
        const transformedUser: User = {
          name: data.user.fullName || 'Creator',
          handle: data.user.instagramHandle || data.user.tiktokHandle || `@${data.user.username}` || '@creator',
          avatar: '/api/placeholder/40/40',
          referralCode: data.user.referralCode,
          totalEarnings: data.stats.totalEarnings,
          thisMonthEarnings: data.stats.thisMonthEarnings,
          pendingPayment: data.stats.pendingEarnings,
          totalReferrals: data.stats.totalReferrals,
          contentPosts: data.stats.totalContentPosts
        };

        setUser(transformedUser);
        setDashboardData(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <DashboardSkeleton/>
    );
  }

  // Error state
  if (error || !user || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Dashboard</h3>
            <p className="text-red-600 mb-4">{error || 'Failed to load dashboard data'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid with real data */}
      <StatsGrid 
        user={user} 
        stats={dashboardData.stats}
        dailyEarnings={dashboardData.dailyEarnings}
      />
      
      {/* Quick Actions - event handlers will work here */}
      <QuickActions user={user} />
      
      {/* Recent Activity with real data */}
      <RecentActivity 
        activities={dashboardData.recentActivity}
        transactions={dashboardData.recentTransactions}
      />
    </>
  );
}