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

  if (!data) return null;

   const progressPercentage = data.target > 0 ? (data.progress / data.target) * 100 : 0;
    const isTargetMet = progressPercentage >= 100;



  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quarterly Target</h1>
          <p className="text-white mt-1">Track your progress towards unlocking amazing bonuses!</p>
        </div>
        {isTargetMet && (
          <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg font-semibold">
            <Gift className="h-5 w-5" />
            <span>Bonus Unlocked!</span>
          </div>
        )}
      </div>
      
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