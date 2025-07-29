"use client";

import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { tiersData } from '@/lib/tierData';
import { Check, Star } from 'lucide-react';

export default function TierSelectionPage() {
  const [selectedTier, setSelectedTier] = useState('Silver');
  const { openModal } = useModal();
  const [onboardingEmail, setOnboardingEmail] = useState<string | null>(null);

  useEffect(() => {
    // This hook runs once when the component mounts to get the user's identity.
    const email = localStorage.getItem('user_email_for_onboarding');
    if (email) {
      setOnboardingEmail(email);
    } else {
      console.error("No onboarding email found. Please verify your email first.");
      // In a real app, you might redirect them to login if the email is missing.
      // For now, an alert is sufficient for debugging.
      alert("Could not identify user. Please return to the login page and try again.");
    }
  }, []); // Empty array ensures it runs only once.

  const handleSelectTier = (tierName: string) => {
    if (!onboardingEmail) {
      alert("User identity could not be confirmed. Please try the verification link again.");
      return;
    }
    setSelectedTier(tierName);
    openModal('TIER_OVERVIEW', { tierName, email: onboardingEmail });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8 lg:mb-14">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-md lg:text-lg text-gray-600">Select the tier that best fits your goals to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-7xl">
        {tiersData.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              selectedTier === tier.name
                ? 'border-orange-500 bg-white shadow-xl transform-gpu -translate-y-2'
                : 'border-gray-200 bg-white hover:border-orange-400 hover:-translate-y-1'
            }`}
            onClick={() => handleSelectTier(tier.name)}
          >
            {tier.name === 'Silver' && ( // Example of a recommended tag
              <div>
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommended
                </div>
                <div className="absolute top-2 right-2 p-1 bg-orange-500 rounded-full text-white">
                    <Star className="h-4 w-4" />
                </div>
              </div>
            )}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">{tier.name}</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{tier.price}</p>
              <p className="mt-1 text-xs text-orange-700 font-bold uppercase">Annual Subscription</p>
            </div>
            <ul className="mt-6 space-y-3 text-left flex-grow">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectTier(tier.name)}
              className={`w-full mt-6 py-2.5 text-md font-semibold rounded-lg transition-colors ${
                selectedTier === tier.name
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Choose Plan
            </button>
            {selectedTier === tier.name && (
                <div className="absolute top-2 right-2 p-1 bg-orange-500 rounded-full text-white">
                    <Check className="h-4 w-4" />
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}