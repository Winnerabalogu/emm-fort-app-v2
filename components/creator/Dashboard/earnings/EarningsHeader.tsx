"use client"
import React from 'react';
import { DollarSign } from 'lucide-react';
import { EarningsHeaderProps } from '@/types/Creatortypes/earnings';

const EarningsHeader: React.FC<EarningsHeaderProps> = ({ totalEarnings }) => {
  const formatCurrency = (amount: number): string => 
    `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Earnings Dashboard</h1>
          <p className="text-white">Track your commission earnings and payout history</p>
          <p className="text-white text-sm mt-2">
            Total earned: {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
          <DollarSign className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default EarningsHeader;