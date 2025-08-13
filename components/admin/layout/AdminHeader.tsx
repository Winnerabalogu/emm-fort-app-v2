"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Bell, User, LogOut, Shield } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5" />
          </button>

          {/* Admin badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
            <Shield className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Admin</span>
          </div>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-orange-600" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {session?.user?.fullName || session?.user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {session?.user?.email}
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}