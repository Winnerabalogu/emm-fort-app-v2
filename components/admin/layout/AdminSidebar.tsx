// components/admin/layout/AdminSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Settings,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Wallet
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const AdminSidebar = memo(function AdminSidebar({ 
  isOpen, 
  isCollapsed, 
  onClose, 
  onToggleCollapse 
}: AdminSidebarProps) {
  const pathname = usePathname();
  
  const navigation = useMemo(() => [
    { name: 'Overview', href: '/admin/overview', icon: LayoutDashboard },
    { name: 'Users Management', href: '/admin/users', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: DollarSign },
    { name: 'Save Requests', href: '/admin/savings', icon: Wallet },
    { name: 'WordPress Sales', href: '/admin/wordpress-sales', icon: ShoppingCart },
    { name: 'Commissions', href: '/admin/commissions', icon: TrendingUp },
    { name: 'Tier Management', href: '/admin/tiers', icon: UserCheck },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ], []);

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transform transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        
        {/* Header */}
        <div className={`flex items-center h-16 px-6 border-b border-gray-200 ${
          isCollapsed ? 'lg:justify-center lg:px-4' : 'justify-between'
        }`}>
          <h1 className={`text-xl font-bold text-orange-600 transition-all duration-300 ${
            isCollapsed ? 'lg:hidden' : ''
          }`}>
            {isCollapsed ? 'AP' : 'Admin Panel'}
          </h1>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 space-y-1 ${isCollapsed ? 'lg:px-2' : ''}`}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${
                    isCollapsed 
                      ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-2' 
                      : 'px-4 py-2'
                  } ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isCollapsed ? 'lg:mr-0' : 'mr-3'
                  }`} />
                  <span className={`transition-all duration-300 ${
                    isCollapsed ? 'lg:hidden' : ''
                  }`}>
                    {item.name}
                  </span>
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                    {item.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 ${
          isCollapsed ? 'lg:px-2 lg:text-center' : ''
        }`}>
          <div className={`text-xs text-gray-500 transition-all duration-300 ${
            isCollapsed ? 'lg:hidden' : ''
          }`}>
            Admin Dashboard v1.0
          </div>
          {isCollapsed && (
            <div className="hidden lg:block text-xs text-gray-500">
              v1.0
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default AdminSidebar;