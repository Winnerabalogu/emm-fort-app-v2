"use client"
import React, { useState } from 'react';
import { Plus, Edit, Hash, Instagram, Music } from 'lucide-react';
import { DragDropContainer, DragItemProps } from '@/components/ui/DragDropComponents';

// Use a flexible interface that accommodates different type systems
export interface FlexibleCaptionTemplate {
  id: string;
  title: string;
  content: string;
  platform: 'Instagram' | 'TikTok' | 'Both';
  hashtags: string[];
  category: string;
  // Allow additional properties that might be in the actual type
  [key: string]: string | number | string[] ; // Update the index type
}

interface EnhancedCaptionTemplatesProps {
  captions: FlexibleCaptionTemplate[];
  onCopyCaption: (caption: FlexibleCaptionTemplate) => void;
  onReorderCaptions?: (captions: FlexibleCaptionTemplate[]) => void;
}

const EnhancedCaptionTemplates: React.FC<EnhancedCaptionTemplatesProps> = ({ 
  captions, 
  onCopyCaption,
  onReorderCaptions 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRequestCaption = (): void => {
    console.log('Request new caption template');
  };

  const handleCopyCaption = async (caption: FlexibleCaptionTemplate) => {
    try {
      const fullCaption = `${caption.content}\n\n${caption.hashtags.join(' ')}`;
      await navigator.clipboard.writeText(fullCaption);
      
      setCopiedId(caption.id);
      onCopyCaption(caption);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy caption:', error);
      // Fallback for older browsers
      onCopyCaption(caption);
    }
  };

  if (captions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Pre-written Captions</h3>
          <button 
            onClick={handleRequestCaption}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4" />
            Request Caption
          </button>
        </div>
        
        <div className="text-center py-12">
          <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Captions Available</h4>
          <p className="text-gray-600 mb-6">Request custom captions tailored to your content style</p>
          <button 
            onClick={handleRequestCaption}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Request Your First Caption
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Pre-written Captions</h3>
        <button 
          onClick={handleRequestCaption}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
        >
          <Plus className="h-4 w-4" />
          Request Caption
        </button>
      </div>

      {/* Use drag and drop if onReorderCaptions is provided, otherwise use regular grid */}
      {onReorderCaptions ? (
        <DragDropContainer
          items={captions}
          onReorder={onReorderCaptions}
          renderItem={(caption, index, dragProps) => (
            <FlexibleCaptionCard
              caption={caption}
              onCopy={handleCopyCaption}
              dragProps={dragProps}
              isCopied={copiedId === caption.id}
            />
          )}
          gridCols="grid-cols-1 lg:grid-cols-2"
          disabled={false}
          showReorderHint={true}
          className="captions-grid"
        />
      ) : (
        <RegularCaptionGrid 
          captions={captions}
          onCopyCaption={handleCopyCaption}
          copiedId={copiedId}
        />
      )}
    </div>
  );
};

// Flexible Caption Card for drag and drop
const FlexibleCaptionCard: React.FC<{
  caption: FlexibleCaptionTemplate;
  onCopy: (caption: FlexibleCaptionTemplate) => void;
  dragProps: DragItemProps;
  isCopied: boolean;
}> = ({ caption, onCopy, dragProps, isCopied }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDragging, isDragOver, dragHandleProps } = dragProps;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(caption);
  };

  const getPlatformIcon = (platform: string) => {
    const platformStr = platform.toLowerCase();
    
    switch (platformStr) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'tiktok':
        return <Music className="h-4 w-4 text-gray-900" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <Instagram className="h-3 w-3 text-pink-600" />
            <Music className="h-3 w-3 text-gray-900" />
          </div>
        );
      default:
        return <Hash className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-700';
    
    const colors = {
      'lifestyle': 'bg-purple-100 text-purple-700',
      'recipe': 'bg-green-100 text-green-700',
      'tutorial': 'bg-blue-100 text-blue-700',
      'review': 'bg-yellow-100 text-yellow-700',
      'promotional': 'bg-red-100 text-red-700',
      'educational': 'bg-indigo-100 text-indigo-700',
      'entertainment': 'bg-pink-100 text-pink-700'
    };
    
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div 
      {...dragHandleProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 rounded-xl p-6 cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95 border-orange-300 rotate-1' : 
        isDragOver ? 'border-orange-400 shadow-xl scale-[1.03] bg-orange-50' :
        isHovered ? 'border-orange-300 shadow-md' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getPlatformIcon(caption.platform)}
          <h4 className="font-semibold text-gray-900 truncate">{caption.title}</h4>
        </div>
        {caption.category && (
          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${getCategoryColor(caption.category)}`}>
            {caption.category}
          </span>
        )}
      </div>
      
      {/* Caption Content Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
          {caption.content}
        </p>
        {caption.content.length > 150 && (
          <div className="absolute bottom-0 right-0 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent px-2 py-1">
            <span className="text-xs text-gray-500">...</span>
          </div>
        )}
      </div>
      
      {/* Hashtags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {caption.hashtags.slice(0, 5).map((tag, index) => (
          <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        {caption.hashtags.length > 5 && (
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
            +{caption.hashtags.length - 5} more
          </span>
        )}
      </div>
      
      {/* Copy Button */}
      <button 
        onClick={handleCopy}
        disabled={isCopied}
        className={`w-full px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 ${
          isCopied
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        <Hash className="h-4 w-4" />
        {isCopied ? 'Copied!' : 'Copy Caption'}
      </button>

      {/* Word Count */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {caption.content.split(' ').length} words • {caption.hashtags.length} hashtags
      </div>
    </div>
  );
};

// Regular grid component for when drag and drop is not needed
const RegularCaptionGrid: React.FC<{
  captions: FlexibleCaptionTemplate[];
  onCopyCaption: (caption: FlexibleCaptionTemplate) => void;
  copiedId: string | null;
}> = ({ captions, onCopyCaption, copiedId }) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'tiktok':
        return <Music className="h-5 w-5 text-gray-900" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <Instagram className="h-4 w-4 text-pink-600" />
            <Music className="h-4 w-4 text-gray-900" />
          </div>
        );
      default:
        return <Hash className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-700';
    
    const colors = {
      'lifestyle': 'bg-purple-100 text-purple-700',
      'recipe': 'bg-green-100 text-green-700',
      'tutorial': 'bg-blue-100 text-blue-700',
      'review': 'bg-yellow-100 text-yellow-700',
      'promotional': 'bg-red-100 text-red-700',
      'educational': 'bg-indigo-100 text-indigo-700',
      'entertainment': 'bg-pink-100 text-pink-700'
    };
    
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {captions.map((caption) => (
        <div 
          key={caption.id} 
          className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getPlatformIcon(caption.platform)}
              <span className="text-sm text-gray-600 truncate capitalize">
                {caption.platform}
              </span>
            </div>
            {caption.category && (
              <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${getCategoryColor(caption.category)}`}>
                {caption.category}
              </span>
            )}
          </div>

          <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
            {caption.title}
          </h4>
          
          {/* Caption Content Preview */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4 relative">
            <p className="text-sm text-gray-800 line-clamp-3">
              {caption.content}
            </p>
            {caption.content.length > 150 && (
              <div className="absolute bottom-0 right-0 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent px-2 py-1">
                <span className="text-xs text-gray-500">...</span>
              </div>
            )}
          </div>

          {/* Hashtags Preview */}
          <div className="flex flex-wrap gap-1 mb-4">
            {caption.hashtags.slice(0, 5).map((hashtag, index) => (
              <span 
                key={index} 
                className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
              >
                {hashtag}
              </span>
            ))}
            {caption.hashtags.length > 5 && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                +{caption.hashtags.length - 5} more
              </span>
            )}
          </div>

          {/* Copy Button */}
          <button 
            onClick={() => onCopyCaption(caption)}
            disabled={copiedId === caption.id}
            className={`w-full px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
              copiedId === caption.id
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <Hash className="h-4 w-4" />
            {copiedId === caption.id ? 'Copied!' : 'Copy Caption'}
          </button>

          {/* Word Count */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            {caption.content.split(' ').length} words • {caption.hashtags.length} hashtags
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedCaptionTemplates;