/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, X, User, Sparkles, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarProps } from '@/types/Creatortypes/dashboard';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react'; 
import Link from 'next/link';

interface ExtendedSidebarProps extends SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<ExtendedSidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  sidebarLinks,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const pathname = usePathname();

  const handleCopyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(user?.referralCode || '');
      toast.success('Referral code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/creator/auth/login' });
  };

  // Helper function to check if link is active
  const isLinkActive = (href: string) => {
    if (href === '/creator/dashboard' && pathname === '/creator/dashboard') {
      return true;
    }
    if (href !== '/creator/dashboard' && pathname.startsWith(href)) {
      return true;
    }
    return false;
  };

  // Loading skeleton when user is not available
  if (!user) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" 
            onClick={onClose}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
        `}>
          
          {/* Desktop Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors z-10"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}

          {/* Logo Skeleton */}
          <div className={`flex items-center h-16 px-6 border-b border-gray-200 ${isCollapsed ? 'lg:px-4 lg:justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              {!isCollapsed && (
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="lg:hidden p-1 text-gray-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Skeleton */}
          <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'lg:p-4' : ''}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center lg:gap-0' : ''}`}>
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              {!isCollapsed && (
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="mt-4 bg-gray-100 rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Skeleton */}
          <nav className="flex-1 py-6 space-y-1 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                {!isCollapsed && <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>}
              </div>
            ))}
          </nav>

          {/* Quick Stats Skeleton */}
          {!isCollapsed && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </div>
          )}

          {/* Logout Skeleton */}
          <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'lg:p-2' : ''}`}>
            <div className={`flex items-center gap-3 px-3 py-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              {!isCollapsed && <div className="h-4 bg-gray-200 rounded w-16"></div>}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden mobile-backdrop" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
      `}>
        
        {/* Desktop Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors z-10"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Logo */}
        <div className={`flex items-center h-16 px-6 border-b border-gray-200 ${isCollapsed ? 'lg:px-4 lg:justify-center' : 'justify-between'}`}>
          <Link href="/creator/dashboard" className={`flex items-center gap-2 ${isCollapsed ? 'lg:gap-0' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="lg:block">
                <div className="font-bold text-gray-900">EMM-FORT</div>
                <div className="text-xs text-orange-600 font-medium">Creator</div>
              </div>
            )}
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'lg:p-4' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center lg:gap-0' : ''}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 lg:block">
                <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                <div className="text-sm text-gray-500 truncate">{user.handle}</div>
              </div>
            )}
          </div>
          
          {/* Referral Code - Hidden when collapsed */}
          {!isCollapsed && (
            <div className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100 lg:block">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Your Code
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono font-bold text-orange-700">{user.referralCode}</div>
                <button 
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-orange-100 rounded transition-colors"
                  aria-label="Copy referral code"
                >
                  <Copy className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto sidebar-nav ${isCollapsed ? 'lg:px-2' : 'px-4'}`}>
          {sidebarLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            
            return (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                    ${isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                    }
                  `}
                  title={isCollapsed ? link.name : undefined}
                >
                  <link.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {!isCollapsed && (
                    <span className="lg:block">{link.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50">
                    {link.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Stats - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200 lg:block">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold text-gray-900">₦{user.totalEarnings?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Referrals</span>
                <span className="font-semibold text-gray-900">{user.totalReferrals || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'lg:p-2' : ''}`}>
          <div className="relative group">
            <button 
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="lg:block">Sign Out</span>
              )}
            </button>
            
            {/* Tooltip for collapsed logout */}
            {isCollapsed && (
              <div className="hidden lg:group-hover:block absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50">
                Sign Out
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;