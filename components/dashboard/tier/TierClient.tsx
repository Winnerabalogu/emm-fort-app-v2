/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { tiersData } from '@/lib/tierData';
import { Tier } from '@prisma/client';
import CurrentTierCard from '@/components/dashboard/tier/CurrentTierCard';
import UpgradeTierCard from '@/components/dashboard/tier/UpgradeTierCard';
import { useModal } from '@/contexts/ModalContext';
import TierPageLoader from '@/components/dashboard/tier/TierPageLoader'; 

export default function TierClient({ session }: { session: any }) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Show loader while data is being fetched
  if (isLoading) {
    return <TierPageLoader />;
  }

  // Show fallback if no data (optional error state)
  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load tier information</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const tierImage = `/tiers/${profileData.tier?.toLowerCase() || 'basic'}.png`;

  const tierOrder: { [key in Tier]: number } = {
    'BASIC': 0, 'BRONZE': 1, 'SILVER': 2, 'GOLD': 3, 'PLATINUM': 4
  };
  const currentTierIndex = profileData.tier ? tierOrder[profileData.tier] : -1;

  const handleUpgrade = (targetTier: Tier) => {
    openModal('UPGRADE_TIER', {
      tierName: targetTier,
      currentTier: profileData.tier!,
      email: session.user.email,
      paidDownlines: profileData.downlines.length,
    });
  };

  return (
    <div className="space-y-8">
      <CurrentTierCard
        tier={profileData.tier!}
        expiryDate={profileData.subscriptionExpiryDate}
        imageUrl={tierImage}
      />
      <div className='space-y-4'>
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg p-2">
          <h1 className="text-2xl font-bold text-white p-2">Upgrade Your plan</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiersData.map((tier, index) => {
            const tierName = tier.name.toUpperCase() as Tier;
            const isCurrent = profileData.tier === tierName;
            const isDowngrade = index < currentTierIndex;

            return (
              <UpgradeTierCard
                key={tier.name}
                tier={{
                  name: tierName,
                  price: tier.price,
                  features: tier.features
                }}
                isCurrent={isCurrent}
                isDowngrade={isDowngrade}
                onUpgradeClick={() => handleUpgrade(tierName)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}