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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
 
  // Initialize sidebar collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

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
 
  // Show loading spinner for auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Authenticating...</span>
        </div>
      </div>
    );
  }
 
  // Redirect if not authenticated or not a creator
  if (status === "unauthenticated" || !session?.user?.isCreator) {
    redirect('/creator/auth/login');
    return null;
  }
 
  // Create user object from session
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