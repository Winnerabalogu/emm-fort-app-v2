/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/earnings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Users, Award } from 'lucide-react';
import TransactionTable from '@/components/dashboard/TransactionTable';

interface EarningsData {
  totalEarned: number;
  commissionEarnings: number;
  bonusEarnings: number;
  history: any[]; 
}

function EarningsPageContent() {
  const { status } = useSession({ required: true });
  const [data, setData] = useState<EarningsData | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/earnings')
        .then(res => res.json())
        .then(setData);
    }
  }, [status]);

  if (!data) {
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
                <th className="px-6 py-4 text-left">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-12"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-14"></div>
                </th>
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
                  <td className="px-6 py-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-18"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse">
                      <div className="h-6 bg-green-100 rounded-full w-16"></div>
                    </div>
                  </td>
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
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

      {/* --- THIS IS THE FIX --- */}
      {/* Use the new TransactionTable component to display the history */}
      <TransactionTable 
        title="Earnings History" 
        transactions={data.history}
      />
      
    </div>
  );
}

export default function EarningsPage() {
  return (
    <SessionProvider>
      <EarningsPageContent />
    </SessionProvider>
  );
}