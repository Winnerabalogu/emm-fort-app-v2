"use client";

import { Check, Lock } from 'lucide-react';
import { Tier } from '@prisma/client';

export interface TierInfo {
  name: Tier;
  price: string;
  features: string[];
}

export interface UpgradeTierCardProps {
  tier: TierInfo;
  isCurrent: boolean;
  isDowngrade: boolean;
  onUpgradeClick: () => void;
}

export default function UpgradeTierCard({
  tier,
  isCurrent,
  isDowngrade,
  onUpgradeClick,
}: UpgradeTierCardProps) {
  
  const canUpgrade = !isCurrent && !isDowngrade;

  return (  
    <div
      className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 ${
        isCurrent ? 'border-orange-500 bg-orange-50' : 'bg-white'
      } ${!canUpgrade ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:-translate-y-1'} ${canUpgrade ? 'cursor-pointer' : ''}`}
     
    >
      {isCurrent && (
        <div className="absolute top-2 right-2 p-1.5 bg-orange-500 rounded-full text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">{tier.name}</h3>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{tier.price}</p>
        <p className="mt-1 text-xs text-gray-500">Annual Fee</p>
      </div>

      <ul className="mt-6 space-y-3 text-left flex-grow">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 shrink-0 mr-2 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* The button's only job is to also call the passed-in function */}
      <button        
        onClick={canUpgrade ? onUpgradeClick : undefined}
        disabled={!canUpgrade}
        className="w-full mt-6 py-2.5 text-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {isCurrent ? 'Current Plan' : (isDowngrade ? (
          <> <Lock className="h-4 w-4" /> Downgrade </>
        ) : 'Upgrade Now')}
      </button>
    </div>
  );
}