/* eslint-disable jsx-a11y/alt-text */
"use client"
import React, { useState, ReactNode } from 'react';
import { Copy, Eye, GripVertical, Instagram, Music, Play, Video , Image} from 'lucide-react';
import { ContentTemplate, CaptionTemplate } from '@/types/Creatortypes/contentHub';
import { EngagementBadge, DifficultyBadge } from '../creator/Dashboard/content';

// Generic drag and drop interfaces
interface DragDropItem {
  id: string;
  [key: string]: string | number | boolean | undefined;
}

interface DragDropContainerProps<T extends DragDropItem> {
  items: T[];
  onReorder: (newOrder: T[]) => Promise<void> | void;
  renderItem: (item: T, index: number, dragProps: DragItemProps) => ReactNode;
  className?: string;
  gridCols?: 'grid-cols-1' | 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4';
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
    // Small delay to prevent flickering
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

// Draggable Caption Card
const DraggableCaptionCard: React.FC<{
  caption: CaptionTemplate;
  onCopy: (caption: CaptionTemplate) => void;
  dragProps: DragItemProps;
}> = ({ caption, onCopy, dragProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDragging, isDragOver, dragHandleProps } = dragProps;

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className={`h-4 w-4 transition-colors ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
          <h4 className="font-semibold text-gray-900">{caption.title}</h4>
        </div>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full">
          {caption.platform}
        </span>
      </div>
      
      {/* Caption Content */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {caption.content}
        </p>
      </div>
      
      {/* Hashtags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {caption.hashtags.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      
      {/* Copy Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onCopy(caption);
        }}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy Caption
      </button>
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