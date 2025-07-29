"use client";

import { useEffect, useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { X, Mail, Phone, Package, CalendarDays, TrendingUp } from 'lucide-react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Tier } from '@prisma/client';
import Image from 'next/image';

interface DownlineDetails {
  fullName: string;
  email: string;
  phone: string;
  tier: Tier;
  subscriptionStartDate: string | null;
  createdAt: string;
  totalEarnings: number;
}

const DetailItem = ({ 
  icon: Icon, 
  label, 
  value, 
  isEmail = false 
}: { 
  icon: React.ElementType, 
  label: string, 
  value: string | React.ReactNode,
  isEmail?: boolean 
}) => (
  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg flex items-start gap-3 sm:gap-4 min-w-0">
    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-brand mt-1 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
      <p className={`font-semibold text-gray-800 text-sm sm:text-base ${
        isEmail ? 'break-all' : 'break-words'
      }`}>
        {value}
      </p>
    </div>
  </div>
);

export default function DownlineOverviewModal() {
  const { closeModal, payload } = useModal();
  const [details, setDetails] = useState<DownlineDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const downlineId = payload?.downlineId;

  useEffect(() => {    
    if (!downlineId) {
      setError("Downline ID not provided.");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/downlines/${downlineId}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch downline details.");
        }
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [downlineId]); 

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
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
    
    if (error) {
      return (
        <div className="text-center text-red-600 p-4 sm:p-8 bg-red-50 rounded-lg">
          <p className="font-semibold text-sm sm:text-base">Could not load details.</p>
          <p className="text-xs sm:text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (details) {
      const status = details.subscriptionStartDate ? 'Paid' : 'Unsubscribed';
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl">
            <Image 
              src="/images/user-avatar.png" 
              alt="Avatar" 
              width={48} 
              height={48} 
              className="rounded-full sm:w-16 sm:h-16" 
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words leading-tight">
                {details.fullName}
              </h3>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${ 
                status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' 
              }`}>
                {status}
              </span>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="space-y-3 sm:space-y-4">
            {/* Email - Full width for better handling of long emails */}
            <DetailItem 
              icon={Mail} 
              label="Email" 
              value={details.email} 
              isEmail={true}
            />
            
            {/* Two column grid for other details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailItem 
                icon={Phone} 
                label="Phone Number" 
                value={details.phone} 
              />
              <DetailItem 
                icon={Package} 
                label="Current Tier" 
                value={<span className="capitalize">{details.tier.toLowerCase()}</span>} 
              />
            </div>
            
            {/* Join Date - Full width on mobile for better readability */}
            <div className="sm:hidden">
              <DetailItem 
                icon={CalendarDays} 
                label="Join Date" 
                value={new Date(details.createdAt).toLocaleDateString()} 
              />
            </div>
            
            {/* Join Date - In grid on larger screens */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem 
                  icon={CalendarDays} 
                  label="Join Date" 
                  value={new Date(details.createdAt).toLocaleDateString()} 
                />
                <div></div> {/* Empty div for spacing */}
              </div>
            </div>
          </div>
          
          {/* Earnings Section */}
          <div className="p-4 sm:p-6 bg-green-50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-green-700 font-semibold mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Total Earnings Generated For You</span>
            </div>
            <p className="font-bold text-2xl sm:text-3xl text-green-800">
              {formatNaira(details.totalEarnings)}
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl shadow-xl max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Downline Overview</h2>
        <button 
          onClick={closeModal} 
          className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
      {renderContent()}
    </div>
  );
}