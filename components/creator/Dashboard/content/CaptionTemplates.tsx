import { DragDropContainer, DraggableCaptionCard } from "@/components/ui/DragDropComponents";
import { CaptionTemplate } from "@/types/Creatortypes/contentHub";
import { Plus, Copy } from "lucide-react";

export const EnhancedCaptionTemplates: React.FC<{
  captions: CaptionTemplate[];
  onCopyCaption: (caption: CaptionTemplate) => void;
  onReorderCaptions: (newOrder: CaptionTemplate[]) => Promise<void> | void;
}> = ({ captions, onCopyCaption, onReorderCaptions }) => {
  
  const handleRequestCaption = (): void => {
    console.log('Request new caption');
  };

  if (captions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Pre-written Captions</h3>
          <button 
            onClick={handleRequestCaption}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Caption
          </button>
        </div>
        
        <div className="text-center py-12">
          <Copy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pre-written Captions</h3>
        <button 
          onClick={handleRequestCaption}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Request Caption
        </button>
      </div>

      <DragDropContainer
        items={captions}
        onReorder={onReorderCaptions}
        gridCols="grid-cols-1"
        className="lg:grid-cols-2"
        renderItem={(caption, index, dragProps) => (
          <DraggableCaptionCard
            caption={caption}
            onCopy={onCopyCaption}
            dragProps={dragProps}
          />
        )}
      />
    </div>
  );
};