/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Target, Gift } from 'lucide-react';
import MonthlyTargetChart from '@/components/dashboard/index/MonthlyTargetChart'; 
import TransactionTable from '@/components/dashboard/TransactionTable';

interface TargetData {
  target: number;
  progress: number;
  history: any[];
  chartData: { name: string; value: number }[];
}

function TargetsPageContent() {
  const { status } = useSession({ required: true });
  const [data, setData] = useState<TargetData | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/targets')
        .then(res => res.json())
        .then(setData);
    }
  }, [status]);

  if (!data) return (
  <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            {/* Page Title */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-100 rounded-md"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Content Sections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 w-16 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>         
                );

   const progressPercentage = data.target > 0 ? (data.progress / data.target) * 100 : 0;
    const isTargetMet = progressPercentage >= 100;



  return (
    <div className="space-y-8">
      {/* Page Header */}      
          <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
          <h1 className="text-3xl font-bold text-white">Quarterly Target</h1>
          <p className="text-white mt-1">Track your progress towards unlocking amazing bonuses!</p>
        </div>
        {isTargetMet && (
          <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg font-semibold">
            <Gift className="h-5 w-5" />
            <span>Bonus Unlocked!</span>
          </div>
        )}            
      {/* Main Target Visualization */}
        <div className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-3xl font-bold text-gray-900">{formatNaira(data.progress)}</span>
          <span className="text-lg text-gray-500">of {formatNaira(data.target)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-right text-sm font-medium text-gray-600 mt-2">{progressPercentage.toFixed(1)}% Complete</p>
      </div>

    <div className="space-y-8">
        <MonthlyTargetChart  chartData={{
              monthly: data.chartData || [],
              quarterly: [],
              yearly: []
            }} 
          />
        <TransactionTable title="Commission History This Quarter" transactions={data.history} />
      </div>
    </div>
  );
}

export default function TargetsPage() {
  return (
    <SessionProvider>
      <TargetsPageContent />
    </SessionProvider>
  );
}