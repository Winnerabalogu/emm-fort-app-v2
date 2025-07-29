"use client";

import { useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { tiersData } from '@/lib/tierData';
import { useRouter } from 'next/navigation';
import { Check, X, LoaderCircle } from 'lucide-react';

export default function TierOverviewModal() {
  const { closeModal, payload } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierName = payload?.tierName;
  const userEmail = payload?.email;
  const tier = tiersData.find(t => t.name === tierName);

  if (!tier) return null;

  const handleAction = async () => {
    if (!userEmail) {
      setError("User identity could not be confirmed. Please close this and try again.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (tier.name === 'Basic') {
        const response = await fetch('/api/tiers/select-basic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        if (!response.ok) throw new Error('Failed to activate Basic plan.');                
        closeModal();        
        router.push('/auth/payment-success');

      } else {
        // Handle paid tier selection
        const response = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierName: tier.name, email: userEmail }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to start payment process.');        
       setIsLoading(false);
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');    
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{tier.name} Tier Overview</h2>
        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      <p className="text-gray-600 mb-6">You are about to subscribe to the {tier.name} plan.</p>

      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between font-semibold">
          <span className="text-gray-700">Annual Subscription Fee</span>
          <span className="text-gray-900">{tier.price}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-700">Primary Commission</span>
          <span className="text-green-600">{tier.primaryCommission}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-700">Secondary Commission</span>
          <span className="text-green-600">{tier.secondaryCommission}</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-2">Features Included:</h3>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-center text-red-500 mt-4 text-sm">{error}</p>}

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={closeModal}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleAction}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : (tier.name === 'Basic' ? 'Confirm Basic Plan' : 'Proceed to Pay')}
        </button>
      </div>
    </div>
  );
}