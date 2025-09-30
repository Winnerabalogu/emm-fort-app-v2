/* eslint-disable jsx-a11y/alt-text */
"use client"
import React, { useState, ReactNode } from 'react';
import { Eye, GripVertical, Instagram, Music, Play, Video, Image, Hash } from 'lucide-react';
import { ContentTemplate, CaptionTemplate } from '@/types/Creatortypes/contentHub';
import { EngagementBadge, DifficultyBadge } from '../creator/Dashboard/content';

// Generic drag and drop interfaces
interface DragDropItem {
  id: string;
}

interface DragDropContainerProps<T extends DragDropItem> {
  items: T[];
  onReorder: (newOrder: T[]) => Promise<void> | void;
  renderItem: (item: T, index: number, dragProps: DragItemProps) => ReactNode;
  className?: string;
  gridCols?: string;
  disabled?: boolean;
  showReorderHint?: boolean;
}

interface DragItemProps {
  isDragging: boolean;
  isDragOver: boolean;
  dragHandleProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDragEnd: () => void;
  };
}

// Generic Drag and Drop Container
const DragDropContainer = <T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
  className = '',
  gridCols = 'grid-cols-1',
  disabled = false,
  showReorderHint = true
}: DragDropContainerProps<T>) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    
    setDraggedItem(index);
    setIsReordering(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Add visual feedback to drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(-5deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (disabled || draggedItem === index) return;
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setTimeout(() => setDragOverItem(null), 50);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (disabled || draggedItem === null || draggedItem === dropIndex) {
      resetDragState();
      return;
    }

    const newItems = [...items];
    const draggedItemData = newItems[draggedItem];
    
    // Remove dragged item
    newItems.splice(draggedItem, 1);
    
    // Insert at new position
    const adjustedDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newItems.splice(adjustedDropIndex, 0, draggedItemData);
    
    try {
      await onReorder(newItems);
    } catch (error) {
      console.error('Failed to reorder items:', error);
    }
    
    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setIsReordering(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showReorderHint && !disabled && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Drag to reorder items
          </div>
        </div>
      )}
      
      <div className={`grid gap-4 ${gridCols}`}>
        {items.map((item, index) => {
          const dragProps: DragItemProps = {
            isDragging: draggedItem === index,
            isDragOver: dragOverItem === index,
            dragHandleProps: {
              draggable: !disabled,
              onDragStart: (e) => handleDragStart(e, index),
              onDragOver: handleDragOver,
              onDrop: (e) => handleDrop(e, index),
              onDragEnter: () => handleDragEnter(index),
              onDragLeave: handleDragLeave,
              onDragEnd: handleDragEnd,
            }
          };

          return (
            <div key={item.id}>
              {renderItem(item, index, dragProps)}
            </div>
          );
        })}
      </div>
      
      {isReordering && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Reordering items...
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Draggable Template Card
const DraggableTemplateCard: React.FC<{ 
  template: ContentTemplate; 
  onUse: (template: ContentTemplate) => void;
  onPreview: (template: ContentTemplate) => void;
  dragProps: DragItemProps;
}> = ({ template, onUse, onPreview, dragProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDragging, isDragOver, dragHandleProps } = dragProps;

  return (
    <div 
      {...dragHandleProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-lg border-2 p-4 cursor-move transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isDragging ? 'opacity-50 scale-95 border-orange-300 rotate-2' : 
        isDragOver ? 'border-orange-400 shadow-xl scale-[1.05] bg-orange-50' :
        isHovered ? 'border-orange-300 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className={`h-4 w-4 transition-colors ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
          <div className="flex items-center gap-2">
            {template.type === 'video' ? <Video className="h-4 w-4 text-gray-600" /> : <Image className="h-4 w-4 text-gray-600" />}
            <span className="text-xs text-gray-500">{template.duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {template.platform === 'Instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
          {template.platform === 'TikTok' && <Music className="h-4 w-4 text-black" />}
          {template.platform === 'Both' && (
            <>
              <Instagram className="h-4 w-4 text-pink-500" />
              <Music className="h-4 w-4 text-black" />
            </>
          )}
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            #{tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <EngagementBadge engagement={template.engagement} />
          <DifficultyBadge difficulty={template.difficulty} />
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUse(template);
          }}
          className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          Use Template
        </button>
      </div>
    </div>
  );
};

// Enhanced Draggable Caption Card with better features
const DraggableCaptionCard: React.FC<{
  caption:  CaptionTemplate & { category?: string }; // Allow additional properties
  onCopy: (caption: CaptionTemplate) => void;
  dragProps: DragItemProps;
}> = ({ caption, onCopy, dragProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isDragging, isDragOver, dragHandleProps } = dragProps;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const fullCaption = `${caption.content}\n\n${caption.hashtags.join(' ')}`;
      await navigator.clipboard.writeText(fullCaption);
      
      setIsCopied(true);
      onCopy(caption);
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy caption:', error);
      onCopy(caption);
    }
  };

  const getPlatformIcon = (platform: "Instagram" | "TikTok" | "Both" | string) => {
    const platformStr = typeof platform === 'string' ? platform.toLowerCase() : platform;
    
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
          <GripVertical className={`h-4 w-4 flex-shrink-0 transition-colors ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
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

// Export the components
export { 
  DragDropContainer, 
  DraggableTemplateCard, 
  DraggableCaptionCard,
};

export type { DragDropItem, DragDropContainerProps, DragItemProps };