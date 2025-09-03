import { DragDropContainer, DraggableTemplateCard } from "@/components/ui/DragDropComponents";
import { ContentTemplate } from "@/types/Creatortypes/contentHub";
import { Plus, Camera } from "lucide-react";

export const EnhancedContentTemplates: React.FC<{
  templates: ContentTemplate[];
  onUseTemplate: (template: ContentTemplate) => void;
  onPreviewTemplate: (template: ContentTemplate) => void;
  onReorderTemplates: (newOrder: ContentTemplate[]) => Promise<void> | void;
}> = ({ templates, onUseTemplate, onPreviewTemplate, onReorderTemplates }) => {
  
  const handleRequestTemplate = (): void => {
    console.log('Request new template');
  };

  if (templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ready-to-Use Templates</h3>
          <button 
            onClick={handleRequestTemplate}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ready-to-Use Templates</h3>
        <button 
          onClick={handleRequestTemplate}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Request Template
        </button>
      </div>

      <DragDropContainer
        items={templates}
        onReorder={onReorderTemplates}
        gridCols="grid-cols-2"
        className="lg:grid-cols-3"
        renderItem={(template, index, dragProps) => (
          <DraggableTemplateCard
            template={template}
            onUse={onUseTemplate}
            onPreview={onPreviewTemplate}
            dragProps={dragProps}
          />
        )}
      />
    </div>
  );
};
