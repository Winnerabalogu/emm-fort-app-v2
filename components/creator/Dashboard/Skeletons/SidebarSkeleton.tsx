// components/creator/Dashboard/Skeletons/SidebarSkeleton.tsx
import React from 'react';

interface SidebarSkeletonProps {
  isCollapsed?: boolean;
}

export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({ isCollapsed = false }) => {
  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 flex flex-col
      ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
      hidden lg:flex
    `}>
      {/* User Profile Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          {!isCollapsed && (
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="px-4 space-y-2 flex-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            {!isCollapsed && <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>}
          </div>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          {!isCollapsed && <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>}
        </div>
      </div>
    </div>
  );
};

// components/creator/Dashboard/Skeletons/HeaderSkeleton.tsx
export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <div className="lg:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Page title */}
          <div className="space-y-1">
            <div className="w-48 h-7 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
          </div>
        </div>

        {/* Right side - Search + Notifications + User */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="hidden md:block w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Notification button */}
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* User avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>
  );
};

