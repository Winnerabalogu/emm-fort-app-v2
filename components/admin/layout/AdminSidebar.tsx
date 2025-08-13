// components/admin/layout/AdminSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
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
  onClose: () => void;
}

const navigation = [
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
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

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
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-orange-600">Admin Panel</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Admin Dashboard v1.0
          </div>
        </div>
      </div>
    </>
  );
}