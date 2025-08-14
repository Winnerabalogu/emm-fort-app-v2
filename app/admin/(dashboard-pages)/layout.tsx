// components/admin/layout/AdminLayout.tsx
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => {
    if (isLargeScreen) {
      // Desktop: toggle collapse
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      // Mobile: open sidebar
      setSidebarOpen(true);
    }
  }, [isLargeScreen, sidebarCollapsed]);
  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  const sidebarState = useMemo(() => ({
    isOpen: sidebarOpen || isLargeScreen,
    isCollapsed: sidebarCollapsed,
    onClose: handleSidebarClose,
    onToggleCollapse: handleToggleCollapse
  }), [sidebarOpen, isLargeScreen, sidebarCollapsed, handleSidebarClose, handleToggleCollapse]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar {...sidebarState} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <AdminHeader onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}