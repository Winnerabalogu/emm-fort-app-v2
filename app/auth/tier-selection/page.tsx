"use client";

import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { tiersData } from '@/lib/tierData';
import { Check, Star, Sparkles } from 'lucide-react';

export default function TierSelectionPage() {
  const [selectedTier, setSelectedTier] = useState('Silver');
  const { openModal } = useModal();
  const [onboardingEmail, setOnboardingEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('user_email_for_onboarding');
    if (email) {
      setOnboardingEmail(email);
    } else {
      console.error("No onboarding email found. Please verify your email first.");
      alert("Could not identify user. Please return to the login page and try again.");
    }
  }, []);

  const handleSelectTier = (tierName: string) => {
    if (!onboardingEmail) {
      alert("User identity could not be confirmed. Please try the verification link again.");
      return;
    }
    setSelectedTier(tierName);
    openModal('TIER_OVERVIEW', { tierName, email: onboardingEmail });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
      {/* Header Section */}
      <div className="px-4 pt-12 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Choose Your Plan
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Select Your Perfect Tier
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your goals and unlock your full potential
          </p>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Desktop: Flex layout for better control */}
          <div className="hidden lg:flex justify-center gap-6 flex-wrap max-w-6xl mx-auto">
            {tiersData.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer min-h-[500px] ${
                  // Responsive widths for better layout
                  tiersData.length === 3 ? 'w-80' :
                  tiersData.length === 4 ? 'w-72' :
                  tiersData.length === 5 ? 'w-64' : 'w-80'
                } ${
                  selectedTier === tier.name
                    ? 'border-orange-500 bg-white shadow-2xl transform-gpu -translate-y-3 scale-105'
                    : 'border-gray-200 bg-white hover:border-orange-400 hover:-translate-y-2 hover:shadow-lg'
                }`}
                onClick={() => handleSelectTier(tier.name)}
              >
                {/* Popular Badge */}
                {tier.name === 'Silver' && (
                  <>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-6 py-2 rounded-full uppercase tracking-wider shadow-lg">
                      ⭐ Most Popular
                    </div>
                    <div className="absolute top-4 right-4 p-2 bg-orange-500 rounded-full text-white shadow-lg">
                      <Star className="h-5 w-5" />
                    </div>
                  </>
                )}

                {/* Selected Indicator */}
                {selectedTier === tier.name && (
                  <div className="absolute top-4 right-4 p-2 bg-orange-500 rounded-full text-white shadow-lg">
                    <Check className="h-5 w-5" />
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h2>
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  </div>
                  <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">
                    Annual Subscription
                  </p>
                </div>

                {/* Features List */}
                <div className="flex-grow">
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectTier(tier.name)}
                  className={`w-full mt-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
                    selectedTier === tier.name
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow-md'
                  }`}
                >
                  {selectedTier === tier.name ? 'Selected ✓' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Mobile & Tablet: Grid layout */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                {tier.name === 'Silver' && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Recommended
                    </div>
                    <div className="absolute top-3 right-3 p-1.5 bg-orange-500 rounded-full text-white">
                      <Star className="h-4 w-4" />
                    </div>
                  </>
                )}

                {selectedTier === tier.name && tier.name !== 'Silver' && (
                  <div className="absolute top-3 right-3 p-1.5 bg-orange-500 rounded-full text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h2>
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{tier.price}</p>
                  <p className="text-xs text-orange-700 font-bold uppercase">Annual Subscription</p>
                </div>

                <ul className="space-y-3 flex-grow mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tier.name)}
                  className={`w-full py-3 text-md font-semibold rounded-lg transition-colors ${
                    selectedTier === tier.name
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {selectedTier === tier.name ? 'Selected ✓' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white border-t border-gray-200 px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing? All plans include our money-back guarantee.
          </p>
          <p className="text-sm text-gray-500">
            You can upgrade or downgrade your plan anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}