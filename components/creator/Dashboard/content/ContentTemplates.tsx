import React from 'react';
import { Plus, Camera, Eye, Instagram, Music } from 'lucide-react';
import { ContentTemplate } from '@/types/Creatortypes/contentHub';
import { DragDropContainer, DraggableTemplateCard } from '@/components/ui/DragDropComponents';

// Use a flexible interface that accommodates different type systems
interface FlexibleContentTemplate {
  id: string;
  title: string;
  description: string;
  platform: string | string[] | 'Instagram' | 'TikTok' | 'Both';
  type: string;
  duration: string;
  tags: string[];
  engagement: string;
  difficulty: string;
  [key: string]: string | number | string[] ; // Update the index type  
}
interface EnhancedContentTemplatesProps {  
  templates: FlexibleContentTemplate[];
  onUseTemplate: (template: ContentTemplate |   FlexibleContentTemplate) => void;
  onPreviewTemplate: (template: ContentTemplate | FlexibleContentTemplate) => void;
  onReorderTemplates?: (templates: FlexibleContentTemplate[]) => void;
}

const EnhancedContentTemplates: React.FC<EnhancedContentTemplatesProps> = ({ 
  templates, 
  onUseTemplate, 
  onPreviewTemplate,
  onReorderTemplates 
}) => {
  const handleRequestTemplate = (): void => {
    console.log('Request new template');
  };

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Ready-to-Use Templates</h3>
          <button 
            onClick={handleRequestTemplate}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4" />
            Request Template
          </button>
        </div>
        
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h4>
          <p className="text-gray-600 mb-6">Request custom templates tailored to your content style</p>
          <button 
            onClick={handleRequestTemplate}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Request Your First Template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Ready-to-Use Templates</h3>
        <button 
          onClick={handleRequestTemplate}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
        >
          <Plus className="h-4 w-4" />
          Request Template
        </button>
      </div>

      {/* Use drag and drop if onReorderTemplates is provided, otherwise use regular grid */}
      {onReorderTemplates ? (
        <DragDropContainer
          items={templates}
          onReorder={onReorderTemplates}
          renderItem={(template, index, dragProps) => (
            <DraggableTemplateCard
              template={template as ContentTemplate}
              onUse={onUseTemplate}
              onPreview={onPreviewTemplate}
              dragProps={dragProps}
            />
          )}
          gridCols="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          disabled={false}
          showReorderHint={true}
          className="templates-grid"
        />
      ) : (
        
        <RegularTemplateGrid
          templates={templates}
          onUseTemplate={onUseTemplate}
          onPreviewTemplate={onPreviewTemplate}
        />
      )}
    </div>
  );
};

// Regular grid component for when drag and drop is not needed
const RegularTemplateGrid: React.FC<{
  templates: FlexibleContentTemplate[];
  onUseTemplate: (template: FlexibleContentTemplate) => void;
  onPreviewTemplate: (template: FlexibleContentTemplate) => void;
}> = ({ templates, onUseTemplate, onPreviewTemplate }) => {
  const getPlatformIcon = (platform: string | string[]) => {
    const platformStr = Array.isArray(platform) ? platform.join(',') : platform;
    
    if (platformStr.toLowerCase().includes('instagram') && platformStr.toLowerCase().includes('tiktok')) {
      return (
        <div className="flex gap-1">
          <Instagram className="h-4 w-4 text-pink-600" />
          <Music className="h-4 w-4 text-gray-900" />
        </div>
      );
    } else if (platformStr.toLowerCase().includes('instagram')) {
      return <Instagram className="h-5 w-5 text-pink-600" />;
    } else if (platformStr.toLowerCase().includes('tiktok')) {
      return <Music className="h-5 w-5 text-gray-900" />;
    }
    
    return <Camera className="h-5 w-5 text-gray-600" />;
  };

  const getPlatformText = (platform: string | string[]) => {
    if (Array.isArray(platform)) {
      return platform.join(', ');
    }
    return platform;
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement.toLowerCase()) {
      case 'very high':
        return 'bg-green-100 text-green-700';
      case 'high':
        return 'bg-blue-100 text-blue-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {templates.map((template) => (
        <div 
          key={template.id} 
          className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getPlatformIcon(template.platform)}
              <span className="text-sm text-gray-600 truncate">
                {getPlatformText(template.platform)}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${getEngagementColor(template.engagement)}`}>
              {template.engagement}
            </span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2 text-base md:text-lg line-clamp-2">
            {template.title}
          </h4>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{template.tags.length - 3}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <span className="font-medium">Difficulty: {template.difficulty}</span>
            {template.duration && (
              <span className="font-medium">Duration: {template.duration}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => onPreviewTemplate(template)}
              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button 
              onClick={() => onUseTemplate(template)}
              className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedContentTemplates;