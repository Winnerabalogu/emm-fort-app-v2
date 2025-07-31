/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { useSession } from 'next-auth/react';
import { Copy, Check, Share2 } from 'lucide-react';
import Modal from '@/components/ui/Modal'

export default function AddDownlineModal() {
  const { closeModal } = useModal();
  const { data: session, status } = useSession();
  const [isCopied, setIsCopied] = useState(false);
  
  const username = (session?.user as any)?.username || 'your_username';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://emm-fort-app-v2.vercel.app';
  const referralLink = `${siteUrl}/auth/register?ref=${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    });
  };

  return (
    <Modal
      title="Share Your Referral Link"
      description="Copy your unique link and share it. You'll earn commissions for every new member who subscribes through it."
      icon={Share2}
      iconColor="orange"
      loading={status === 'loading'}
      primaryAction={{
        label: "Done",
        onClick: closeModal
      }}
    >
      {/* Custom referral link input */}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="w-full pl-4 pr-14 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Copy className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
    </Modal>
  );
}