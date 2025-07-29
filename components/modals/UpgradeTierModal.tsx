"use client";

import { useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import { useSession } from 'next-auth/react'; // <-- IMPORT THIS
import { X, Users, CreditCard, LoaderCircle } from 'lucide-react';
import { upgradeRequirements } from '@/lib/tierData';
import { Tier } from '@prisma/client';

type UpgradeMethod = 'payment' | 'downlines';

export default function UpgradeTierModal() {
  const { closeModal, payload } = useModal();
  const router = useRouter();
  const { update } = useSession(); // <-- GET THE UPDATE FUNCTION
  const [upgradeMethod, setUpgradeMethod] = useState<UpgradeMethod>('payment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!payload) {
    return (   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { tierName: tierToUpgradeTo, currentTier, email: userEmail, paidDownlines = 0 } = payload;

  if (!tierToUpgradeTo || !currentTier) {
    console.error("Modal opened with incomplete data.");
    return null;
  }

  const requirements = upgradeRequirements[currentTier.toUpperCase() as Tier]?.[tierToUpgradeTo.toUpperCase() as Tier];

  if (!requirements) {
    console.error(`No upgrade path found from ${currentTier} to ${tierToUpgradeTo}.`);
    return (
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h3 className="text-xl font-bold text-red-600">Error</h3>
        <p className="mt-2 text-gray-700">This upgrade path is not available.</p>
        <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
      </div>
    );
  }

  const canUpgradeWithDownlines = paidDownlines >= requirements.downlines;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (upgradeMethod === 'payment') {
        const response = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierName: tierToUpgradeTo, email: userEmail }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to start payment.');
        // Redirect to Paystack - this flow is correct.
        window.location.href = data.authorization_url;

      } else { // This is the "Upgrade with Downlines" flow
        const response = await fetch('/api/tiers/upgrade-with-downlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            targetTier: tierToUpgradeTo
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upgrade failed.');
        }

        // --- THE FIX: Refresh client-side data ---
        // 1. Update the Next-Auth session token with the new user data (e.g., new tier).
        await update();

        // 2. Tell Next.js to re-fetch data for the current page, updating the UI.
        router.refresh();

        // 3. Close the modal after the updates are done.
        closeModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // Ensure the loading spinner stops, even if an error occurs.
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upgrade to {tierToUpgradeTo}</h2>
        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
      </div>

      <div className="flex justify-center p-1 bg-gray-200 rounded-lg mb-6">
        <button
          onClick={() => setUpgradeMethod('payment')}
          className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${upgradeMethod === 'payment' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}
        >
          Pay with Card
        </button>
        <button
          onClick={() => setUpgradeMethod('downlines')}
          className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${upgradeMethod === 'downlines' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}
        >
          Use Downlines
        </button>
      </div>

      <div>
        {upgradeMethod === 'payment' && (
          <div className="text-center p-6 bg-orange-50 rounded-lg">
            <CreditCard className="mx-auto h-12 w-12 text-orange-500" />
            <p className="mt-4 text-lg text-gray-700">You will be charged a one-time upgrade fee of:</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{requirements.fee}</p>
          </div>
        )}
        {upgradeMethod === 'downlines' && (
          <div className={`text-center p-6 rounded-lg ${canUpgradeWithDownlines ? 'bg-green-50' : 'bg-red-50'}`}>
            <Users className={`mx-auto h-12 w-12 ${canUpgradeWithDownlines ? 'text-green-500' : 'text-red-500'}`} />
            <p className="mt-4 text-lg text-gray-700">You need <span className="font-bold">{requirements.downlines}</span> paid downlines to upgrade.</p>
            <p className={`text-4xl font-bold mt-2 ${canUpgradeWithDownlines ? 'text-green-600' : 'text-red-600'}`}>
              {paidDownlines} / {requirements.downlines}
            </p>
            <p className="text-sm text-gray-500 mt-1">You currently have {paidDownlines} paid downlines.</p>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      
      <div className="mt-8">
        <button
          onClick={handleUpgrade}
          disabled={isLoading || (upgradeMethod === 'downlines' && !canUpgradeWithDownlines)}
          className="w-full flex justify-center items-center py-3 text-lg font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin h-6 w-6" />
          ) : (
            upgradeMethod === 'payment' ? 'Proceed to Payment' : 'Upgrade with Downlines'
          )}
        </button>
      </div>
    </div>
  );
}