"use client"

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles } from 'lucide-react';

export default function DashboardSwitcher() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Only show if user is a creator (has access to both dashboards)
  if (!session?.user?.isCreator) {
    return null;
  }

  const isOnCreatorDashboard = pathname?.startsWith('/creator/dashboard');
  const isOnRegularDashboard = pathname?.startsWith('/dashboard') && !pathname?.startsWith('/dashboard/creator');

  // Don't show if not on either dashboard
  if (!isOnCreatorDashboard && !isOnRegularDashboard) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            {isOnCreatorDashboard ? (
              <Sparkles className="h-5 w-5 text-white" />
            ) : (
              <LayoutDashboard className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {isOnCreatorDashboard ? 'Creator Dashboard' : 'Affiliate Dashboard'}
            </p>
            <p className="text-sm text-gray-600">
              {isOnCreatorDashboard 
                ? 'Track your content performance and creator earnings' 
                : 'Monitor your referral commissions and network growth'}
            </p>
          </div>
        </div>
        
        <Link 
          href={isOnCreatorDashboard ? '/dashboard' : '/creator/dashboard'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
        >
          {isOnCreatorDashboard ? (
            <>
              <LayoutDashboard className="h-4 w-4" />
              Switch to Affiliate
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Switch to Creator
            </>
          )}
        </Link>
      </div>
    </div>
  );
}