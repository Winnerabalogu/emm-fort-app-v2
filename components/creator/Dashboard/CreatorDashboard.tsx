
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { StatsGrid, QuickActions, RecentActivity } from '@/components/creator/Dashboard';
import { User, DashboardData } from '@/types/Creatortypes/dashboard';
import { DashboardSkeleton } from './Skeletons';

interface CreatorDashboardProps {
  className?: string;
}

export default function CreatorDashboard({ className = '' }: CreatorDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/creator/dashboard', {
        cache: 'no-store', 
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/creator/auth/login';
          return;
        }
        if (response.status === 403) {
          window.location.href = '/';
          return;
        }
        throw new Error(`Failed to load dashboard data: ${response.status}`);
      }
      
      const data = await response.json();
      
      
      const transformedUser: User = {
        name: data.user.fullName || 'Creator',
        handle: data.user.instagramHandle 
          ? `@${data.user.instagramHandle.replace('@', '')}` 
          : data.user.tiktokHandle 
            ? `@${data.user.tiktokHandle.replace('@', '')}` 
            : `@${data.user.username || 'creator'}`,
        avatar: '/api/placeholder/40/40',
        referralCode: data.user.referralCode || `${data.user.username?.toUpperCase() || 'USER'}2024`,
        totalEarnings: data.stats.totalEarnings || 0,
        thisMonthEarnings: data.stats.thisMonthEarnings || 0,
        pendingPayment: data.stats.pendingEarnings || 0,
        totalReferrals: data.stats.totalReferrals || 0,
        contentPosts: data.stats.totalContentPosts || 0
      };

      setUser(transformedUser);
      setDashboardData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [loading, loadDashboardData]);

  
  if (loading) {
    return (
      <div className={`creator-dashboard ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  
  if (error || !user || !dashboardData) {
    return (
      <div className={`creator-dashboard ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
              <p className="text-red-600 mb-6 text-sm leading-relaxed">
                {error || 'We encountered an issue loading your dashboard data. Please try again.'}
              </p>
              <div className="space-y-3">
                <button 
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className={`creator-dashboard space-y-6 ${className}`}>
      {/* Stats Grid with real data */}
      <StatsGrid 
        user={user} 
        stats={dashboardData.stats}
        dailyEarnings={dashboardData.dailyEarnings}
      />
      
      {/* Quick Actions */}
      <QuickActions 
        user={user}
        onRefresh={loadDashboardData}
      />
      
      {/* Recent Activity with real data */}
      <RecentActivity 
        activities={dashboardData.recentActivity}
        isLoading={false}
      />
    </div>
  );
}