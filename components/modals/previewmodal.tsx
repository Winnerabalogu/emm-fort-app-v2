/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { ContentTemplate } from "@/types/Creatortypes/contentHub";
import { X, Video, Eye, Play, Image } from "lucide-react";

interface PreviewModalProps {
  template: ContentTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: ContentTemplate) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  template, 
  isOpen, 
  onClose, 
  onUse 
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Template Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              {template.type === 'video' ? 
                <Video className="h-6 w-6 text-orange-600" /> : 
                <Image className="h-6 w-6 text-orange-600" />
              }
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
              <p className="text-gray-600 mb-2">{template.description}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>📱 {template.platform}</span>
                <span>⏱️ {template.duration}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  template.engagement === 'Very High' ? 'bg-green-100 text-green-800' :
                  template.engagement === 'High' ? 'bg-blue-100 text-blue-800' :
                  template.engagement === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  📈 {template.engagement} Engagement
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  template.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  template.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  🎯 {template.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Image/Video */}
          {template.previewUrl && (
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500 mb-2">
                  <Eye className="h-4 w-4" />
                  Template Preview
                </div>
                <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  {template.type === 'video' ? 
                    <Video className="h-12 w-12 text-gray-400" /> : 
                    <Image className="h-12 w-12 text-gray-400" />
                  }
                </div>
                <p className="text-sm text-gray-500 mt-2">Preview content will be displayed here</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {template.instructions && Array.isArray(template.instructions) && template.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">📋 How to use this template:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                {template.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">🏷️ Recommended Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={() => onUse(template)}
              className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4" />
              Use This Template
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};