import React from 'react';
import { Camera } from 'lucide-react';
import { ContentHubHeaderProps } from '@/types/Creatortypes/contentHub';

const ContentHubHeader: React.FC<ContentHubHeaderProps> = ({ totalPosts }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Content Creation Hub</h1>
          <p className="text-purple-100">
            Create engaging content that converts and earns you more commissions
          </p>
          {totalPosts > 0 && (
            <p className="text-purple-200 text-sm mt-2">
              {totalPosts} pieces of content created
            </p>
          )}
        </div>
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
          <Camera className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default ContentHubHeader;