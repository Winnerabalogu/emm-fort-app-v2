// components/creator/Dashboard/Skeletons.tsx
import React from 'react';

// Dashboard Stats Grid Skeleton
export const StatsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Recent Activity Skeleton
export const RecentActivitySkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[1, 2].map((section) => (
      <div key={section} className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-start gap-4 p-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Content Hub Template Skeleton
export const TemplateGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex gap-2">
            <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
            <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

// Earnings Chart Skeleton
export const EarningsChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
    
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-end justify-between p-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className={`bg-gray-200 rounded-t w-8 h-${20 + (i % 3) * 16}`}></div>
      ))}
    </div>
  </div>
);

// Transaction Table Skeleton
export const TransactionTableSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="flex gap-2">
        {['All', 'Commission', 'Bonus', 'Referral'].map((filter) => (
          <div key={filter} className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
    
    <div className="overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Date', 'Type', 'Amount', 'Customer', 'Status'].map((header) => (
              <th key={header} className="px-6 py-3 text-left">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row} className="border-b border-gray-100">
              <td className="px-6 py-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Content Calendar Skeleton
export const ContentCalendarSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
    
    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-1 mb-4">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-2 text-center">
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} className="aspect-square p-2 border border-gray-100 rounded">
          <div className="w-6 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="space-y-1">
            {Math.random() > 0.7 && (
              <div className="w-full h-2 bg-orange-200 rounded animate-pulse"></div>
            )}
            {Math.random() > 0.8 && (
              <div className="w-3/4 h-2 bg-blue-200 rounded animate-pulse"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// My Content List Skeleton
export const MyContentSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((stat) => (
              <div key={stat} className="text-center space-y-1">
                <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Page Level Skeleton - Full dashboard
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <StatsGridSkeleton />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="w-16 h-4 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
      
      <EarningsChartSkeleton />
    </div>
    
    <RecentActivitySkeleton />
  </div>
);

// Generic Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white rounded-xl p-6 border border-gray-200 animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
      <div className="flex gap-2 mt-6">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}> = ({ size = 'md', className = "", message }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-orange-500 border-t-transparent ${sizeClasses[size]}`}></div>
      {message && (
        <span className="ml-2 text-gray-600 text-sm">{message}</span>
      )}
    </div>
  );
};