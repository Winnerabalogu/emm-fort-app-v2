"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TrendingUp, CheckCircle, AlertCircle, Video, Image, Layers, Calendar, Zap, Eye, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';

// Ensure this interface matches the fields in your Prisma User model for content preferences
interface ContentPreferences {
  preferredPlatforms: string[];
  contentTypes: string[];
  postingFrequency: string;
  niche: string;
  templatePreferences: string[];
  autoSuggestContent: boolean;
  enableAnalytics: boolean;
  showEarningsPublicly: boolean;
}

const platformOptions = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'facebook', label: 'Facebook', icon: '👥' }
];

const contentTypeOptions = [
  { value: 'reel', label: 'Reels/Short Videos', icon: Video },
  { value: 'post', label: 'Photo Posts', icon: Image },
  { value: 'carousel', label: 'Carousel Posts', icon: Layers },
  { value: 'story', label: 'Stories', icon: Calendar }
];

const frequencyOptions = [
  'Daily',
  '3-4 times per week',
  '1-2 times per week',
  'Few times per month',
  'As needed'
];

const nicheOptions = [
  'Lifestyle',
  'Fashion & Beauty',
  'Food & Cooking',
  'Fitness & Health',
  'Technology',
  'Travel',
  'Home & Decor',
  'Entertainment',
  'Education',
  'Business'
];

const templateOptions = [
  'Unboxing Videos',
  'Product Reviews',
  'Comparison Posts',
  'Lifestyle Integration',
  'Tutorial Content',
  'Behind the Scenes'
];

export default function CreatorContentSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<ContentPreferences>({
    defaultValues: {
      preferredPlatforms: [],
      contentTypes: [],
      templatePreferences: [],
      autoSuggestContent: true,
      enableAnalytics: true,
      showEarningsPublicly: false
    }
  });

  const watchedPlatforms = watch('preferredPlatforms') || [];
  const watchedContentTypes = watch('contentTypes') || [];
  const watchedTemplatePrefs = watch('templatePreferences') || [];

  useEffect(() => {
    fetch('/api/creator/content-preferences') // Updated API endpoint
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          reset(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load content preferences.");
        setIsLoading(false);
      });
  }, [reset]);

  const handleCheckboxChange = (field: 'preferredPlatforms' | 'contentTypes' | 'templatePreferences', value: string) => {
    const currentValues = watch(field) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues, { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<ContentPreferences> = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/creator/content-preferences', { // Updated API endpoint
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update preferences.");

      setSuccessMessage(result.message);
      reset(data); // Reset form with the saved data to clear isDirty status

      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Preferences</h2>
            <p className="text-gray-600 text-sm">Customize your content creation workflow</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Preferred Platforms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Platforms</h3>
        <p className="text-sm text-gray-600 mb-4">Select the platforms where you create content</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platformOptions.map((platform) => (
            <label
              key={platform.value}
              className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                watchedPlatforms.includes(platform.value)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                value={platform.value}
                checked={watchedPlatforms.includes(platform.value)}
                onChange={() => handleCheckboxChange('preferredPlatforms', platform.value)}
                className="sr-only"
              />
              <span className="text-2xl">{platform.icon}</span>
              <span className="font-medium text-gray-900">{platform.label}</span>
              {watchedPlatforms.includes(platform.value) && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-orange-500" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Content Types */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Types</h3>
        <p className="text-sm text-gray-600 mb-4">What types of content do you create?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypeOptions.map((type) => {
            const Icon = type.icon;
            return (
              <label
                key={type.value}
                className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  watchedContentTypes.includes(type.value)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={type.value}
                  checked={watchedContentTypes.includes(type.value)}
                  onChange={() => handleCheckboxChange('contentTypes', type.value)}
                  className="sr-only"
                />
                <Icon className={`h-5 w-5 ${
                  watchedContentTypes.includes(type.value) ? 'text-purple-600' : 'text-gray-500'
                }`} />
                <span className="font-medium text-gray-900">{type.label}</span>
                {watchedContentTypes.includes(type.value) && (
                  <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-purple-500" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Posting Frequency & Niche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Posting Frequency</h3>
          <select
            {...register('postingFrequency', { required: 'Please select posting frequency' })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select frequency</option>
            {frequencyOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.postingFrequency && (
            <p className="mt-2 text-sm text-red-600">{errors.postingFrequency.message}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Niche</h3>
          <select
            {...register('niche', { required: 'Please select your niche' })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select niche</option>
            {nicheOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.niche && (
            <p className="mt-2 text-sm text-red-600">{errors.niche.message}</p>
          )}
        </div>
      </div>

      {/* Template Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preferences</h3>
        <p className="text-sm text-gray-600 mb-4">Select templates that match your content style</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templateOptions.map((template) => (
            <label
              key={template}
              className={`relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                watchedTemplatePrefs.includes(template)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                value={template}
                checked={watchedTemplatePrefs.includes(template)}
                onChange={() => handleCheckboxChange('templatePreferences', template)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-gray-900">{template}</span>
              {watchedTemplatePrefs.includes(template) && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-indigo-500" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">Auto-Suggest Content</p>
                <p className="text-sm text-gray-600">Get AI-powered content suggestions</p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('autoSuggestContent')}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Enable Analytics</p>
                <p className="text-sm text-gray-600">Track your content performance</p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('enableAnalytics')}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Show Earnings Publicly</p>
                <p className="text-sm text-gray-600">Display earnings on your profile</p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('showEarningsPublicly')}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()} // This resets to defaultValues or last fetched data
          disabled={!isDirty || isSaving}
        >
          Reset Changes
        </Button>
        <Button
          type="submit"
          isLoading={isSaving}
          disabled={!isDirty || isSaving}
        >
          Save Preferences
        </Button>
      </div>
    </form>
  );
}