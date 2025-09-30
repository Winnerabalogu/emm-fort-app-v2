/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client"
import React, { useState } from 'react';
import { X, Upload, Camera, Video, Image, FileText, Instagram, Music, Copy, Save, Eye, Plus, Trash2 } from 'lucide-react';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (contentData: ContentData) => void;
  selectedTemplate?: ContentTemplate | null;
}

interface ContentData {
  title: string;
  platform: 'Instagram' | 'TikTok' | 'Both';
  type: 'Post' | 'Story' | 'Reel' | 'Video' | 'Carousel';
  description?: string;
  caption: string;
  hashtags: string[];
  templateId?: string;
  mediaFiles: File[];
  publishNow: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  captionTemplate?: string;
  hashtags: string[];
  instructions?: string[];
  tips?: string[];
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  selectedTemplate
}) => {
  const [formData, setFormData] = useState<ContentData>({
    title: selectedTemplate?.title || '',
    platform: (selectedTemplate?.platform as ContentData['platform']) || 'Instagram',
    type: (selectedTemplate?.type as ContentData['type']) || 'Post',
    description: selectedTemplate?.description || '',
    caption: selectedTemplate?.captionTemplate || '',
    hashtags: selectedTemplate?.hashtags || [],
    templateId: selectedTemplate?.id,
    mediaFiles: [],
    publishNow: true,
    scheduledDate: '',
    scheduledTime: '09:00'
  });

  const [currentHashtag, setCurrentHashtag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Partial<ContentData>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<ContentData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.caption.trim()) {
      newErrors.caption = 'Caption is required';
    }

    if (!formData.publishNow) {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = 'Scheduled date is required';
      }
      if (!formData.scheduledTime) {
        newErrors.scheduledTime = 'Scheduled time is required';
      }
      
      if (formData.scheduledDate && formData.scheduledTime) {
        const selectedDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
        const now = new Date();
        
        if (selectedDateTime <= now) {
          newErrors.scheduledDate = 'Please select a future date and time';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate(formData);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: 'Instagram',
      type: 'Post',
      description: '',
      caption: '',
      hashtags: [],
      templateId: undefined,
      mediaFiles: [],
      publishNow: true,
      scheduledDate: '',
      scheduledTime: '09:00'
    });
    setCurrentHashtag('');
    setPreviewMode(false);
    setErrors({});
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      return (isImage || isVideo) && file.size <= maxSize;
    });

    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...validFiles].slice(0, 10) // Max 10 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const addHashtag = () => {
    if (currentHashtag.trim() && !formData.hashtags.includes(currentHashtag.trim()) && formData.hashtags.length < 30) {
      const hashtag = currentHashtag.trim().startsWith('#') ? currentHashtag.trim() : `#${currentHashtag.trim()}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag]
      }));
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index)
    }));
  };

  const contentTypes = {
    Instagram: ['Post', 'Story', 'Reel', 'Carousel'],
    TikTok: ['Video'],
    Both: ['Post', 'Video', 'Story']
  };

  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const renderPreview = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-900 text-white p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            {formData.platform === 'Instagram' ? (
              <Instagram className="h-6 w-6 text-pink-500" />
            ) : formData.platform === 'TikTok' ? (
              <Music className="h-6 w-6 text-white" />
            ) : (
              <div className="flex gap-1">
                <Instagram className="h-5 w-5 text-pink-500" />
                <Music className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h4 className="font-medium">@your_username</h4>
              <p className="text-sm text-gray-400">{formData.type} • Now</p>
            </div>
          </div>

          {formData.mediaFiles.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {formData.mediaFiles.slice(0, 4).map((file, index) => (
                <div key={index} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={getFilePreview(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  {formData.mediaFiles.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                      <span className="text-white font-medium">+{formData.mediaFiles.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-white">
            <p className="mb-2">{formData.caption}</p>
            {formData.hashtags.length > 0 && (
              <p className="text-blue-400">
                {formData.hashtags.join(' ')}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-300">
                <Eye className="h-5 w-5" />
                <span>0</span>
              </button>
              <button className="flex items-center gap-1 text-gray-300">
                <Copy className="h-5 w-5" />
                <span>0</span>
              </button>
            </div>
            <span className="text-sm text-gray-400">Preview</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Main Form - Left Side */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Content</h2>
              {selectedTemplate && (
                <p className="text-sm text-gray-600">Using template: {selectedTemplate.title}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Template Instructions */}
            {selectedTemplate && selectedTemplate.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Template Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {selectedTemplate.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
                {selectedTemplate.tips && selectedTemplate.tips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">Tips:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {selectedTemplate.tips.map((tip, index) => (
                        <li key={index}>💡 {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Give your content a title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <div className="flex gap-2">
                  {(['Instagram', 'TikTok', 'Both'] as const).map(platform => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="radio"
                        name="platform"
                        value={platform}
                        checked={formData.platform === platform}
                        onChange={(e) => {
                          const newPlatform = e.target.value as typeof formData.platform;
                          setFormData(prev => ({ 
                            ...prev, 
                            platform: newPlatform,
                            type: contentTypes[newPlatform][0] as typeof formData.type
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.platform === platform 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}>
                        {platform === 'Instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                        {platform === 'TikTok' && <Music className="h-4 w-4 text-gray-900" />}
                        {platform === 'Both' && (
                          <div className="flex gap-1">
                            <Instagram className="h-3 w-3 text-pink-600" />
                            <Music className="h-3 w-3 text-gray-900" />
                          </div>
                        )}
                        <span className="text-sm">{platform}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {contentTypes[formData.platform].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as typeof formData.type }))}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center gap-2 w-full p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      {type === 'Post' && <Image className="h-4 w-4" />}
                      {type === 'Story' && <Camera className="h-4 w-4" />}
                      {type === 'Reel' && <Video className="h-4 w-4" />}
                      {type === 'Video' && <Video className="h-4 w-4" />}
                      {type === 'Carousel' && <FileText className="h-4 w-4" />}
                      <span className="text-sm font-medium">{type}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Files ({formData.mediaFiles.length}/10)
              </label>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your media files here, or{' '}
                  <label className="text-orange-600 cursor-pointer hover:text-orange-700">
                    browse
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="sr-only"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supports images and videos up to 100MB each
                </p>
              </div>

              {/* Uploaded Files Preview */}
              {formData.mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={getFilePreview(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                            <Video className="h-8 w-8 text-gray-500 mb-2" />
                            <span className="text-xs text-gray-600 px-2 text-center truncate w-full">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {Math.round(file.size / 1024)}KB
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption *
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  errors.caption ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Write your caption here..."
              />
              {errors.caption && <p className="text-red-500 text-sm mt-1">{errors.caption}</p>}
              <p className="text-sm text-gray-500 mt-1">{formData.caption.length}/2200 characters</p>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags ({formData.hashtags.length}/30)
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Add hashtag (without #)"
                />
                <button
                  type="button"
                  onClick={addHashtag}
                  disabled={!currentHashtag.trim() || formData.hashtags.length >= 30}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {hashtag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(index)}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Publishing Options */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Publishing Options</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishOption"
                    checked={formData.publishNow}
                    onChange={() => setFormData(prev => ({ ...prev, publishNow: true }))}
                    className="mr-3 text-orange-500"
                  />
                  <span className="text-sm">Publish immediately</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishOption"
                    checked={!formData.publishNow}
                    onChange={() => setFormData(prev => ({ ...prev, publishNow: false }))}
                    className="mr-3 text-orange-500"
                  />
                  <span className="text-sm">Schedule for later</span>
                </label>

                {!formData.publishNow && (
                  <div className="ml-6 grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                          errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
                    </div>
                    
                    <div>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                          errors.scheduledTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.scheduledTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledTime}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const draftData = { ...formData, publishNow: false, status: 'draft' };
                  console.log('Save as draft:', draftData);
                }}
                className="px-4 py-2 text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {formData.publishNow ? 'Create Content' : 'Schedule Content'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel - Right Side */}
        {previewMode && (
          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateContentModal;