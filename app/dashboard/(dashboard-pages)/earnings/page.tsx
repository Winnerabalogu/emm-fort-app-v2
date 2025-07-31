/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/earnings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Users, Award } from 'lucide-react';
import TransactionTable from '@/components/dashboard/TransactionTable';
import { useRouter } from 'next/navigation';

interface EarningsData {
  totalEarned: number;
  commissionEarnings: number;
  bonusEarnings: number;
  history: any[]; 
}

// Loading skeleton component
function EarningsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <div className="relative p-10 text-center bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="relative z-10 animate-pulse">
          <div className="h-4 bg-white/20 rounded w-32 mx-auto mb-4"></div>
          <div className="h-16 bg-white/30 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-white/20 rounded w-48 mx-auto"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-soft">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-8 w-8 bg-orange-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl shadow-soft">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-8 w-8 bg-indigo-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Type', 'Amount', 'Date', 'Source', 'Status'].map((header, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="animate-pulse flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-100 rounded w-16"></div>
                      </div>
                    </div>
                  </td>
                  {[1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="animate-pulse flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Handle authentication states
    if (status === 'loading') return; // Still checking session
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      const fetchEarningsData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch('/api/earnings', {
            signal: controller.signal,
            cache: 'no-store'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch earnings data');
          }
          
          const earningsData = await response.json();
          setData(earningsData);
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setError('Request timed out. Please try again.');
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchEarningsData();
    }
  }, [status, session, router]);

  // Show loading skeleton while checking session or fetching data
  if (status === 'loading' || isLoading) {
    return <EarningsPageSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Error loading earnings</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton if no data yet
  if (!data) {
    return <EarningsPageSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="relative p-10 text-center bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-2xl shadow-2xl overflow-hidden">
         <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
         <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>
         <div className="relative z-10">
            <p className="text-sm uppercase tracking-widest opacity-70">All-Time Earnings</p>
            <p className="text-6xl font-extrabold my-2 tracking-tight">{formatNaira(data.totalEarned)}</p>
            <p className="opacity-80">Congratulations on your hard work!</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-soft flex items-center gap-4">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
                <p className="text-gray-500">From Commissions</p>
                <p className="text-2xl font-bold text-gray-800">{formatNaira(data.commissionEarnings)}</p>
            </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-soft flex items-center gap-4">
            <Award className="h-8 w-8 text-indigo-500" />
            <div>
                <p className="text-gray-500">From Bonuses</p>
                <p className="text-2xl font-bold text-gray-800">{formatNaira(data.bonusEarnings)}</p>
            </div>
        </div>
      </div>
      
      <TransactionTable 
        title="Earnings History" 
        transactions={data.history}        
      />
    </div>
  );
}