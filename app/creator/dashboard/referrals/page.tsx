/* eslint-disable react/no-unescaped-entities */
// app/creator/referrals/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Copy, Check, Gift, Users, DollarSign, Share2, Instagram, TrendingUp } from 'lucide-react';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  conversionRate: string;
  referralLink: string;
}

const CopyButton = ({ textToCopy, label }: { textToCopy: string; label: string }) => {
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
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy {label}
          </>
        )}
      </button>

      {isCopied && (
        <div className="absolute -top-10 right-0 text-xs bg-green-500 text-white px-2 py-1 rounded shadow-md animate-fadeIn z-10">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  colorClass,
  trend 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  trend?: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {trend && (
        <span className="text-sm font-medium text-green-600">{trend}</span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function CreatorReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/creator/referrals');
        if (!response.ok) {
          throw new Error('Failed to load referral data');
        }
        const referralData = await response.json();
        setData(referralData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{error || 'Failed to load referral data'}</p>
      </div>
    );
  }

  const shareOnSocial = (platform: string) => {
    const message = `Join me on this amazing creator platform! Use my referral code: ${data.referralCode} or click: ${data.referralLink}`;
    const urls = {
      instagram: `https://www.instagram.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`
    };
    
    window.open(urls[platform as keyof typeof urls] || '#', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Gift className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Creator Referrals</h1>
            <p className="text-orange-100">Share your influence and earn commissions</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Referrals"
          value={data.totalReferrals}
          colorClass="bg-blue-500"
          trend="+12% this month"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`₦${data.totalEarnings.toLocaleString()}`}
          colorClass="bg-green-500"
          trend="+8.3% this month"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${data.conversionRate}%`}
          colorClass="bg-purple-500"
        />
      </div>

      {/* Referral Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share this link with your audience. When someone signs up and subscribes, you earn a commission.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                readOnly
                value={data.referralLink}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
              <CopyButton textToCopy={data.referralLink} label="Link" />
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Code</h2>
          <p className="text-sm text-gray-600 mb-4">
            Share this code for users to enter during registration.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                readOnly
                value={data.referralCode}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-lg text-center"
              />
              <CopyButton textToCopy={data.referralCode} label="Code" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share on Social Media</h2>
        <p className="text-sm text-gray-600 mb-6">
          Leverage your social media presence to maximize your referral potential.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => shareOnSocial('instagram')}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            <Instagram className="h-5 w-5" />
            <span className="font-medium">Instagram</span>
          </button>
          <button
            onClick={() => shareOnSocial('twitter')}
            className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Twitter</span>
          </button>
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">WhatsApp</span>
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Facebook</span>
          </button>
        </div>
      </div>

      {/* Tips & Strategy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Referral Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Content Ideas</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Share authentic product reviews and unboxings</li>
              <li>• Create "day in my life" content featuring products</li>
              <li>• Post comparison videos between different brands</li>
              <li>• Share behind-the-scenes of your content creation</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be transparent about your referral partnerships</li>
              <li>• Focus on products you genuinely use and love</li>
              <li>• Engage authentically with your audience</li>
              <li>• Track what content drives the most conversions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">This Month's Performance</h2>
          <span className="text-2xl font-bold text-green-600">₦{data.thisMonthEarnings.toLocaleString()}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Monthly Goal Progress</span>
            <span>67% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}