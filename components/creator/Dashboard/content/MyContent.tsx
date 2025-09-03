import React from 'react';
import { Plus, Camera, Instagram, Video, Calendar, Eye, Heart, MessageCircle, Share } from 'lucide-react';
import { MyContentProps } from '@/types/Creatortypes/contentHub';

const MyContent: React.FC<MyContentProps> = ({ content, onAddNewPost }) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="h-4 w-4" />;
      case 'TikTok':
        return <Video className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Posted Content</h3>
        <button 
          onClick={onAddNewPost}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Post
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {content.map((item) => (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              
              {/* Content Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <span className="text-sm font-semibold text-green-600">₦{item.earnings}</span>
                </div>
                
                {/* Platform and Date */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    {getPlatformIcon(item.platform)}
                    {item.platform} {item.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {item.posted}
                  </span>
                </div>
                
                {/* Engagement Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Eye className="h-4 w-4" />
                    {item.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-pink-600">
                    <Heart className="h-4 w-4" />
                    {item.likes}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <MessageCircle className="h-4 w-4" />
                    {item.comments}
                  </span>
                  <span className="flex items-center gap-1 text-green-600">
                    <Share className="h-4 w-4" />
                    {item.shares}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h4>
          <p className="text-gray-600 mb-6">Start creating content to track your performance and earnings</p>
          <button 
            onClick={onAddNewPost}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Create Your First Post
          </button>
        </div>
      )}
    </div>
  );
};

export default MyContent;