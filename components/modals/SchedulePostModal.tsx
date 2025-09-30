import React, { useState } from 'react';
import { X, Calendar, Clock, Instagram, Music, Hash, Wand2, Save } from 'lucide-react';

interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (postData: ScheduledPostData) => void;
  selectedDate?: string;
}

interface ScheduledPostData {
  title: string;
  platform: 'Instagram' | 'TikTok' | 'Both';
  type: 'Post' | 'Story' | 'Reel' | 'Video' | 'Carousel';
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  hashtags: string[];
  description?: string;
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  selectedDate
}) => {
  const [formData, setFormData] = useState<ScheduledPostData>({
    title: '',
    platform: 'Instagram',
    type: 'Post',
    scheduledDate: selectedDate || new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    caption: '',
    hashtags: [],
    description: ''
  });

  const [currentHashtag, setCurrentHashtag] = useState('');
  const [showCaptionSuggestions, setShowCaptionSuggestions] = useState(false);
  const [errors, setErrors] = useState<Partial<ScheduledPostData>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<ScheduledPostData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.caption.trim()) {
      newErrors.caption = 'Caption is required';
    }
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }
    
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Time is required';
    }

    const selectedDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      newErrors.scheduledDate = 'Please select a future date and time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSchedule(formData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        platform: 'Instagram',
        type: 'Post',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        caption: '',
        hashtags: [],
        description: ''
      });
    }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentHashtag.trim()) {
      e.preventDefault();
      addHashtag();
    }
  };

  const contentTypes = {
    Instagram: ['Post', 'Story', 'Reel', 'Carousel'],
    TikTok: ['Video'],
    Both: ['Post', 'Video', 'Story']
  };

  const suggestedCaptions = [
    "Just picked up these amazing fresh groceries! 🛒✨ Swipe to see what made it into my cart this week.",
    "This recipe is a game changer! 👩‍🍳 All ingredients available through my link - makes shopping so much easier.",
    "Honest review time! 📝 I've been using this for a week and here are my thoughts...",
    "Budget-friendly finds alert! 💰 Proving you don't need to break the bank for quality groceries.",
    "Sunday meal prep session complete! ✅ Spending 2 hours today saves me 10 hours this week."
  ];

  const suggestedHashtags = [
    '#groceryhaul', '#freshfood', '#shopping', '#healthyeating', '#mealprep',
    '#recipe', '#cooking', '#foodie', '#homecooking', '#budgetfriendly',
    '#review', '#productreview', '#recommendation', '#lifestyle', '#contentcreator'
  ];

  const getOptimalTimes = (platform: string) => {
    const times = {
      Instagram: ['09:00', '11:00', '14:00', '17:00', '19:00'],
      TikTok: ['06:00', '10:00', '16:00', '19:00', '21:00'],
      Both: ['09:00', '11:00', '16:00', '19:00']
    };
    return times[platform as keyof typeof times] || times.Instagram;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Give your post a descriptive title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Platform and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform *
              </label>
              <div className="space-y-2">
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
                      className="mr-3 text-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      {platform === 'Instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                      {platform === 'TikTok' && <Music className="h-4 w-4 text-gray-900" />}
                      {platform === 'Both' && (
                        <div className="flex gap-1">
                          <Instagram className="h-4 w-4 text-pink-600" />
                          <Music className="h-4 w-4 text-gray-900" />
                        </div>
                      )}
                      <span className="text-sm">{platform}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as typeof formData.type }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {contentTypes[formData.platform].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.scheduledTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Optimal posting times"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-10 hidden group-hover:block">
                    <p className="text-xs text-gray-600 mb-1">Optimal times:</p>
                    {getOptimalTimes(formData.platform).map(time => (
                      <button
                        key={time}
                        onClick={() => setFormData(prev => ({ ...prev, scheduledTime: time }))}
                        className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
            </div>
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Caption *
              </label>
              <button
                type="button"
                onClick={() => setShowCaptionSuggestions(!showCaptionSuggestions)}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Wand2 className="h-4 w-4" />
                Suggestions
              </button>
            </div>
            
            {showCaptionSuggestions && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Click to use a suggestion:</p>
                <div className="space-y-2">
                  {suggestedCaptions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData(prev => ({ ...prev, caption: suggestion }))}
                      className="block w-full text-left p-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add hashtag (without #)"
              />
              <button
                type="button"
                onClick={addHashtag}
                disabled={!currentHashtag.trim() || formData.hashtags.length >= 30}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Hash className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Suggested hashtags */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Suggested hashtags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.filter(tag => !formData.hashtags.includes(tag)).slice(0, 10).map(hashtag => (
                  <button
                    key={hashtag}
                    onClick={() => {
                      if (formData.hashtags.length < 30) {
                        setFormData(prev => ({
                          ...prev,
                          hashtags: [...prev.hashtags, hashtag]
                        }));
                      }
                    }}
                    className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>

            {/* Current hashtags */}
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

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Add any additional notes or instructions..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}</span>
          </div>
          
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
                // Save as draft logic
                const draftData = { ...formData, status: 'draft' };
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
              <Calendar className="h-4 w-4" />
              Schedule Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePostModal;