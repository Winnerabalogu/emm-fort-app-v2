import React from 'react';
import { Camera, Share2, Copy } from 'lucide-react';
import { QuickActionsProps } from '@/types/Creatortypes/dashboard';
import { generateShareableUrl, sharedUtils } from '@/utils/helpers';
const QuickActions: React.FC<QuickActionsProps> = ({ user }) => {

   const handlers = {  
          onCreateContent: () => {
            sharedUtils.navigateToCreateContent();
          },
          onCopyRef: ()=> {
            sharedUtils.copyToClipboard(user.referralCode);
          },
          onShare: () =>{
            generateShareableUrl(user.referralCode)
          }
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Create Content Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Content</h3>
          <Camera className="h-6 w-6" />
        </div>
        <p className="text-orange-100 mb-4">
          Use our content templates to create engaging posts and earn more commissions
        </p>
        <button 
           onClick={handlers.onCreateContent}
          className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Get Started
        </button>
      </div>

      {/* Share Referral Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Your Code</h3>
          <Share2 className="h-6 w-6 text-gray-600" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-bold flex-1">{user.referralCode}</span>
            <button 
              onClick={handlers.onCopyRef}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Copy referral code"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <button 
            onClick={handlers.onShare}
            className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Share Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;