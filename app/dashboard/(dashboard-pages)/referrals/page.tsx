"use client";

import { useEffect, useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { Copy, Check, Gift, Users, DollarSign } from 'lucide-react';
import { UserProfile } from '@/lib/types';

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        {isCopied ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <Copy className="h-5 w-5 text-brand" />
        )}
      </button>

      {isCopied && (
        <div className="absolute -top-10 right-0 text-xs bg-green-500 text-white px-2 py-1 rounded shadow-md animate-fadeIn">
          Copied!
        </div>
      )}
    </div>
  );
};

function ReferralsPageContent() {
  const { status } = useSession({ required: true });
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => setProfileData(data));
    }
  }, [status]);

  if (status === 'loading' || !profileData) {
    return ( <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const referralLink = `${siteUrl}/auth/register?ref=${profileData.username}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-10 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">

        {/* Header */}
        <div className="p-8 bg-white rounded-2xl shadow-md text-center transition-transform duration-300 hover:scale-105">
          <Gift className="mx-auto h-16 w-16 text-orange-500 drop-shadow-lg animate-bounce" />
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Refer & Earn</h1>
          <p className="mt-2 text-lg text-gray-600">
            Share your unique link with friends to earn commissions when they subscribe.
          </p>
        </div>

        {/* Referral Link */}
        <div className="p-6 bg-white rounded-2xl shadow-md transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Your Referral Link</h2>
          <p className="mt-2 text-sm text-gray-500">
            Copy the link below and share it. When someone signs up using your link, they’ll become your downline.
          </p>
          <div className="relative mt-4">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 focus:outline-none"
            />
            <CopyButton textToCopy={referralLink} />
          </div>
        </div>

        {/* Referral Stats */}
        <div className="p-6 bg-white rounded-2xl shadow-md transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Referral Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-xl font-bold text-gray-900">{profileData.downlines.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-brand" />
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">₦{profileData.totalEarned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-6 bg-white rounded-2xl shadow-md transition-transform duration-300 hover:scale-105">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">How It Works</h2>
          <ol className="mt-4 space-y-3 list-decimal list-inside text-gray-600 text-base">
            <li><strong>Share Your Link:</strong> Send your unique referral link to friends, family, or your audience.</li>
            <li><strong>They Sign Up:</strong> When someone clicks your link and completes their registration and subscription, they are automatically added as your downline.</li>
            <li><strong>You Earn Commissions:</strong> You’ll earn a primary commission on their subscription fee and secondary commissions on the fees of users they refer, depending on your tier.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <SessionProvider>
      <ReferralsPageContent />
    </SessionProvider>
  );
}
