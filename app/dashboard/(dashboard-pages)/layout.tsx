"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/dashboard/layout/Sidebar';
import Header from '@/components/dashboard/layout/Header';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import PageLoader from '@/components/PageLoader';
import { ModalProvider } from '@/contexts/ModalContext';
import ModalManager from '@/components/modals/ModalManager';


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isLargeScreen);
  

  const { status } = useSession({ required: true });

  useEffect(() => {
    setIsSidebarOpen(isLargeScreen);
  }, [isLargeScreen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (status === 'loading') {
  return (
    <div className="flex h-dvh bg-orange-400">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          
          {/* Sidebar Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton - FIXED: Added proper padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
      </div>
    </div>
  );
}
  return (    
    <div className="flex h-dvh bg-orange-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen && !isLargeScreen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={toggleSidebar}></div>
        <div className={`absolute top-0 left-0 h-full transition-transform duration-300 ${isSidebarOpen && !isLargeScreen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar isSidebarOpen={true} isMobile={true} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />              
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>    
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (    
      <ModalProvider>
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
      <ModalManager />
      </ModalProvider>
  );
}