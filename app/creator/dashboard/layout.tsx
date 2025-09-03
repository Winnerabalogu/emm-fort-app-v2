// app/creator/dashboard/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Camera,
  Share2,
  BarChart3,
  Settings
} from 'lucide-react';
import Sidebar from '@/components/creator/Dashboard/sidebar';
import Header from '@/components/creator/Dashboard/Header';
import { User, SidebarLink } from '@/types/Creatortypes/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
   const pathname = usePathname();
   const [loading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
 
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
   
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);
 
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }
 
  if (status === "unauthenticated" || !session?.user?.isCreator) {
    redirect('/creator/auth/login');
    
  }

  
 
  const user: User = {
    name: session.user.name || session.user.fullName || 'Creator',
    handle: session.user.instagramHandle 
      ? `@${session.user.instagramHandle.replace('@', '')}` 
      : session.user.tiktokHandle 
        ? `@${session.user.tiktokHandle.replace('@', '')}` 
        : `@${session.user.username || 'creator'}`,
    avatar: session.user.image || '/api/placeholder/40/40',
    referralCode: `${(session.user.username || session.user.name || 'USER').toUpperCase().replace(/\s/g, '')}2024`,
       
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayment: 0,
    totalReferrals: 0,
    contentPosts: 0
  };
// Dynamic sidebar links with current state based on pathname
  const sidebarLinks: SidebarLink[] = [
    { 
      name: 'Dashboard', 
      href: '/creator/dashboard', 
      icon: LayoutDashboard, 
      current: pathname === '/creator/dashboard'
    },
    { 
      name: 'Earnings', 
      href: '/creator/dashboard/earnings', 
      icon: DollarSign,
      current: pathname.startsWith('/creator/dashboard/earnings')
    },
    { 
      name: 'Content Hub', 
      href: '/creator/dashboard/content', 
      icon: Camera,
      current: pathname.startsWith('/creator/dashboard/content')
    },
    { 
      name: 'My Referrals', 
      href: '/creator/dashboard/referrals', 
      icon: Share2,
      current: pathname.startsWith('/creator/dashboard/referrals')
    },
    { 
      name: 'Analytics', 
      href: '/creator/dashboard/analytics', 
      icon: BarChart3,
      current: pathname.startsWith('/creator/dashboard/analytics')
    },
    { 
      name: 'Settings', 
      href: '/creator/dashboard/settings', 
      icon: Settings,
      current: pathname.startsWith('/creator/dashboard/settings')
    },
  ];

  const handleToggleSidebar = (): void => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = (): void => {
    setIsSidebarOpen(false);
  };

  const handleToggleCollapse = (): void => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
  };

  // Show loading skeleton while user data is being fetched
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dashboard-layout">
        {/* Skeleton Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 flex flex-col
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
          hidden lg:flex
        `}>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              {!isSidebarCollapsed && (
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-4 space-y-2 flex-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                {!isSidebarCollapsed && <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Skeleton Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="lg:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="space-y-1">
                  <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading your dashboard...</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dashboard-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        user={user}
        sidebarLinks={sidebarLinks}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main content wrapper - responsive margin for sidebar */}
      <div className={`
        min-h-screen transition-all duration-300 ease-in-out layout-transition
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Fixed Header */}
        <Header
          onMenuClick={handleToggleSidebar}
          user={user}
        />

        {/* Scrollable Main Content */}
        <main className="dashboard-main content-area p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}