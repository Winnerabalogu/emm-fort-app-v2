/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useState, useEffect ,useCallback} from 'react';
import { Camera, Users, Edit, Calendar, Plus } from 'lucide-react';
import { PreviewModal } from '@/components/modals/previewmodal';
import { sharedUtils } from '@/utils/helpers';

// Import your existing components
import ContentStatsGrid from './ContentStatsGrid';
import TabButton from './TabButton';
import MyContent from './MyContent';
import  { EnhancedCaptionTemplates } from './CaptionTemplates';
import ContentCalendar from './ContentCalendar';

// Import types
import type {
  ContentTemplate,
  UserContent,
  CaptionTemplate,
  ContentStats,
  ContentTabType
} from '@/types/Creatortypes/contentHub';
import { EnhancedContentTemplates } from './ContentTemplates';





class ContentHubAPI {
  private static baseURL = '/api/creator/content';
 static async saveCaptionOrder(captions: CaptionTemplate[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/captions/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          captionOrder: captions.map((c, index) => ({ id: c.id, order: index }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to save caption order');
    } catch (error) {
      console.error('Error saving caption order:', error);
      throw error;
    }
  }
  static async getContentStats(): Promise<ContentStats> {
    try {
      const response = await fetch(`${this.baseURL}?type=stats`);
      if (!response.ok) throw new Error('Failed to fetch content stats');
      const data = await response.json();
      return {
        totalPosts: data.summary?.totalPosts || 0,
        totalViews: this.formatNumber(data.summary?.totalViews || 0),
        avgEngagement: `${((data.summary?.totalLikes + data.summary?.totalComments + data.summary?.totalShares) / data.summary?.totalViews * 100 || 0).toFixed(1)}%`,
        contentEarnings: `₦${this.formatNumber(data.summary?.totalEarnings || 0)}`
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  }

 static async getContentTemplates(): Promise<ContentTemplate[]> {
  try {
    // Add type=templates parameter
    const response = await fetch(`${this.baseURL}/templates?type=templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    
    const result = await response.json();
    
    // Handle the API response structure
    if (result.success && result.data && result.data.templates) {
      return result.data.templates;
    }
    
    // Fallback if structure is different
    if (Array.isArray(result)) {
      return result;
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Return mock data if API fails
    return [
      {
        id: '1',
        title: 'Grocery Haul Unboxing',
        description: 'Show off your fresh groceries with this engaging unboxing format',
        platform: 'Instagram',
        type: 'video',
        duration: '30s',
        tags: ['groceries', 'unboxing', 'fresh', 'haul'],
        engagement: 'High',
        difficulty: 'Easy'
      },
        {
          id: '2',
          title: 'Recipe Prep Tutorial',
          description: 'Step-by-step cooking process that showcases ingredients',
          platform: 'TikTok',
          type: 'video',
          duration: '60s',
          tags: ['recipe', 'cooking', 'tutorial', 'ingredients'],
          engagement: 'Very High',
          difficulty: 'Medium'
        },
        {
          id: '3',
          title: 'Product Review Story',
          description: 'Quick review format perfect for Instagram Stories',
          platform: 'Instagram',
          type: 'image',
          duration: '15s',
          tags: ['review', 'product', 'story', 'recommendation'],
          engagement: 'Medium',
          difficulty: 'Easy'
        },
        {
          id: '4',
          title: 'Family Meal Prep',
          description: 'Show how you prep meals for the whole family',
          platform: 'Both',
          type: 'video',
          duration: '90s',
          tags: ['family', 'meal-prep', 'lifestyle', 'organization'],
          engagement: 'High',
          difficulty: 'Medium'
        }
      ];
    }
  }

  static async saveTemplateOrder(templates: ContentTemplate[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/templates/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateOrder: templates.map((t, index) => ({ id: t.id, order: index }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to save template order');
    } catch (error) {
      console.error('Error saving template order:', error);
      throw error;
    }
  }

  static async getMyContent(): Promise<{ content: UserContent[], total: number }> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      
      return {
        content: data.content?.map((item: { id: string; title: string; platform: string; type: string; createdAt: string; views: string; likes: string; comments: string; shares: string; earnings: number; postUrl: string; }) => ({
          id: item.id,
          title: item.title,
          platform: item.platform,
          type: item.type,
          posted: this.formatDate(item.createdAt),
          views: item.views || 0,
          likes: item.likes || 0,
          comments: item.comments || 0,
          shares: item.shares || 0,
          earnings: this.formatNumber(item.earnings || 0),
          postUrl: item.postUrl
        })) || [],
        total: data.pagination?.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching my content:', error);
      throw error;
    }
  }

 static async getCaptionTemplates(): Promise<CaptionTemplate[]> {
  try {
    // Use the captions endpoint which returns the correct structure
    const response = await fetch(`${this.baseURL}/captions`);
    if (!response.ok) throw new Error('Failed to fetch captions');
    
    const result = await response.json();
    
    // Handle the response structure from captions route
    if (result.captions && Array.isArray(result.captions)) {
      return result.captions;
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    console.error('Error fetching captions:', error);
    throw error;
  }
}

  private static formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }
}

// Main Creator Content Hub Component
const CreatorContentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentTabType>('templates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    template: ContentTemplate | null;
  }>({
    isOpen: false,
    template: null
  });

  // State for content data
  const [contentStats, setContentStats] = useState<ContentStats>({
    totalPosts: 0,
    totalViews: '0',
    avgEngagement: '0%',
    contentEarnings: '₦0'
  });

  
const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([]);
  const [captionTemplates, setCaptionTemplates] = useState<CaptionTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [captionsLoaded, setCaptionsLoaded] = useState(false);

const loadContentTemplates = useCallback(async () => {
  if (templatesLoading) return;
  
  try {
    setTemplatesLoading(true);
    const templates = await ContentHubAPI.getContentTemplates();
    setContentTemplates(Array.isArray(templates) ? templates : []);
    setTemplatesLoaded(true);
  } catch (err) {
    console.error('Failed to load templates:', err);
    setContentTemplates([]);
    setError('Failed to load templates');
  } finally {
    setTemplatesLoading(false);
  }
}, [templatesLoading]); // Only re-create if templatesLoading changes


 const loadCaptionTemplates = useCallback(async () => {
  try {
    const captions = await ContentHubAPI.getCaptionTemplates();
    setCaptionTemplates(captions);
    setCaptionsLoaded(true);
  } catch (err) {
    console.error('Failed to load captions:', err);
    setError('Failed to load captions');
  }
}, []);
  // Load data when component mounts or tab changes
useEffect(() => {
  if (activeTab === 'templates') {
    loadContentStats();
    if (!templatesLoaded && !templatesLoading) {
      loadContentTemplates();
    }
  } else if (activeTab === 'captions') {
    if (!captionsLoaded) {
      loadCaptionTemplates();
    }
  }
}, [activeTab, templatesLoaded, captionsLoaded, templatesLoading, loadContentTemplates, loadCaptionTemplates]);
  const loadContentStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await ContentHubAPI.getContentStats();
      setContentStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };



  // Enhanced reordering handlers with API persistence
  const handleReorderTemplates = async (newOrder: ContentTemplate[]) => {
    const previousOrder = [...contentTemplates];
    
    // Optimistically update UI
    setContentTemplates(newOrder);
    
    try {
      await ContentHubAPI.saveTemplateOrder(newOrder);
      sharedUtils.showNotification('Template order updated', 'success');
    } catch (error) {
      // Revert on failure
      setContentTemplates(previousOrder);
      sharedUtils.showNotification('Failed to update template order', 'error');
    }
  };

  const handleReorderCaptions = async (newOrder: CaptionTemplate[]) => {
    const previousOrder = [...captionTemplates];
    
    // Optimistically update UI
    setCaptionTemplates(newOrder);
    
    try {
      await ContentHubAPI.saveCaptionOrder(newOrder);
      sharedUtils.showNotification('Caption order updated', 'success');
    } catch (error) {
      // Revert on failure
      setCaptionTemplates(previousOrder);
      sharedUtils.showNotification('Failed to update caption order', 'error');
    }
  };

  // Shared event handlers that get passed to components
  const handlers = {
    // Template handlers
    onUseTemplate: async (template: ContentTemplate) => {
      try {
        const response = await fetch('/api/creator/content/use-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: template.id })
        });
        
        if (response.ok) {
          sharedUtils.showNotification(`Template "${template.title}" is ready to use!`, 'success');
          setPreviewModal({ isOpen: false, template: null }); 
          sharedUtils.navigateToCreateContent();
        } else {
          throw new Error('Failed to use template');
        }
      } catch (error) {
        sharedUtils.showNotification('Failed to use template', 'error');
      }
    },

    onPreviewTemplate: (template: ContentTemplate) => {
      setPreviewModal({ isOpen: true, template });
    },

    // Content handlers
    onAddNewPost: () => {
      sharedUtils.navigateToCreateContent();
    },

    onEditPost: (postId: string) => {
      window.location.href = `/creator/dashboard/content/edit/${postId}`;
    },

    onDeletePost: async (postId: string) => {
      if (window.confirm('Are you sure you want to delete this post?')) {
        try {
          const response = await fetch(`/api/creator/content?id=${postId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            sharedUtils.showNotification('Post deleted successfully', 'success');
            window.location.reload();
          } else {
            throw new Error('Failed to delete post');
          }
        } catch (error) {
          sharedUtils.showNotification('Failed to delete post', 'error');
        }
      }
    },

    // Caption handlers
    onCopyCaption: async (caption: CaptionTemplate) => {
      const fullCaption = `${caption.content}\n\n${caption.hashtags.join(' ')}`;
      const success = await sharedUtils.copyToClipboard(fullCaption);
      if (success) {
        sharedUtils.showNotification('Caption copied to clipboard', 'success');
      } else {
        sharedUtils.showNotification('Failed to copy caption', 'error');
      }
    },

    // Calendar handlers
    onSchedulePost: () => {
      sharedUtils.navigateToSchedule();
    },

    // General handlers
    onCreateContent: () => {
      sharedUtils.navigateToCreateContent();
    }
  };

  const tabs = [
    { id: 'templates' as ContentTabType, label: 'Content Templates', icon: Camera },
    { id: 'my-content' as ContentTabType, label: 'My Content', icon: Users },
    { id: 'captions' as ContentTabType, label: 'Caption Templates', icon: Edit },
    { id: 'schedule' as ContentTabType, label: 'Content Calendar', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
       case 'templates':
  return (
    <div className="p-6">
      {loading && <LoadingSpinner />}
      {error && <ErrorState message={error} onRetry={loadContentStats} />}
      {!loading && !error && (
        <>
          <ContentStatsGrid stats={contentStats} />
          <div className="mt-6">
            <EnhancedContentTemplates 
              templates={contentTemplates || []} // Extra safety
              onUseTemplate={handlers.onUseTemplate}
              onPreviewTemplate={handlers.onPreviewTemplate}
              onReorderTemplates={handleReorderTemplates}
            />
          </div>
        </>
      )}
    </div>
  );

      case 'my-content':
        return (
          <div className="p-6">
            <MyContent 
              content={[]}
              onAddNewPost={handlers.onAddNewPost}
            />
          </div>
        );

      case 'captions':
        return (
          <div className="p-6">
            <EnhancedCaptionTemplates 
              captions={captionTemplates}
              onCopyCaption={handlers.onCopyCaption}
              onReorderCaptions={handleReorderCaptions}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="p-6">
            <ContentCalendar 
              onSchedulePost={handlers.onSchedulePost}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Hub</h2>
          <p className="text-gray-600">Manage your content templates, posts, and scheduling</p>
        </div>
        <button 
          onClick={handlers.onCreateContent}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Content
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-6 pt-6">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Preview Modal */}
      <PreviewModal
        template={previewModal.template}
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, template: null })}
        onUse={handlers.onUseTemplate}
      />
    </div>
  );
};

// Loading and Error Components
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-red-600 mb-2">⚠️</div>
    <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
    <p className="text-red-700 mb-4">{message}</p>
    <button 
      onClick={onRetry}
      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default CreatorContentHub;