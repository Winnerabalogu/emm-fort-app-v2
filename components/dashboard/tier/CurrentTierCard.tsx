"use client";

import { Tier } from '@prisma/client';
import Image from 'next/image';

interface CurrentTierCardProps {
  tier: Tier;
  expiryDate: Date | null;
  imageUrl: string;
}

export default function CurrentTierCard({ tier, expiryDate, imageUrl }: CurrentTierCardProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Your Current Plan</h1>
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center overflow-hidden">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold">{tier}</h2>
          <p className="opacity-80 mt-1">Your subscription is active and provides exclusive benefits.</p>
          {expiryDate && (
            <p className="text-sm mt-4 opacity-90">
              Renews on: {new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <div className="relative mt-4 sm:mt-0 -mr-8 -my-10 opacity-70 w-[150px] h-[100px]">
           <Image 
              src={imageUrl} 
              alt={`${tier} tier pyramid`} 
              fill
              style={{ objectFit: 'contain' }}
            />
        </div>
      </div>
    </div>
  );
}