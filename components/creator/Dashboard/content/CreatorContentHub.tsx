/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Users, Edit, Calendar, Plus, BarChart3, Clock, TrendingUp } from 'lucide-react';

// Import your existing components
import ContentStatsGrid from './ContentStatsGrid';
import MyContent from './MyContent';
import ContentCalendar from './ContentCalendar';
import EnhancedContentTemplates from './ContentTemplates';
import MobileSliderNavigation from './MobileSliderNavigation';
import EnhancedCaptionTemplates, { FlexibleCaptionTemplate } from './CaptionTemplates';

// Import modals
import { PreviewModal } from '@/components/modals/previewmodal';
import SchedulePostModal from '@/components/modals/SchedulePostModal';
import { AnalyticsModal } from '@/components/modals/AnalyticsModal';
import ContentInsightsModal from '@/components/modals/ContentInsightsModal';
import PostingTimesModal from '@/components/modals/PostingTimesModal';
import CreateContentModal from '@/components/modals/CreateContentModal';

// Import utilities and types
import { sharedUtils } from '@/utils/helpers';
import type {
  ContentTemplate,
  UserContent,
  CaptionTemplate,
  ContentStats,
  ContentTabType
} from '@/types/Creatortypes/contentHub';

// Unified ContentTemplate interface to avoid type conflicts
interface UnifiedContentTemplate {
  id: string;
  title: string;
  description: string;
  platform: 'Instagram' | 'TikTok' | 'Both' | string | string[];
  type: string;
  duration?: string;
  tags: string[];
  engagement: string;
  difficulty: string;
  captionTemplate?: string;
  hashtags?: string[];
  instructions?: string[];
  tips?: string[];
}

// Modal state interface
interface ModalStates {
  preview: { isOpen: boolean; template: UnifiedContentTemplate | null };
  schedule: boolean;
  analytics: boolean;
  insights: boolean;
  postingTimes: boolean;
  createContent: { isOpen: boolean; template: UnifiedContentTemplate | null };
}

// API Service
class ContentHubAPI {
  private static baseURL = '/api/creator/content';

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

  static async getContentTemplates(): Promise<UnifiedContentTemplate[]> {
    try {
      const response = await fetch(`${this.baseURL}/templates?type=templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.templates) {
        return result.data.templates;
      }
      
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
          difficulty: 'Easy',
          captionTemplate: 'Fresh groceries for the week! Check out what made it into my cart 🛒',
          hashtags: ['#groceryhaul', '#fresh', '#shopping'],
          instructions: ['Film yourself unpacking groceries', 'Show each item clearly', 'Share prices if comfortable'],
          tips: ['Use good lighting', 'Keep it authentic', 'Engage with comments quickly']
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
          difficulty: 'Medium',
          captionTemplate: 'Easy weeknight dinner recipe! All ingredients linked in bio 👩‍🍳',
          hashtags: ['#recipe', '#cooking', '#easymeals'],
          instructions: ['Prep all ingredients first', 'Film each step clearly', 'Show the final result'],
          tips: ['Use trending audio', 'Keep transitions smooth', 'Add text overlays for clarity']
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
          difficulty: 'Easy',
          captionTemplate: 'Honest review of this amazing product! Link in stories 📝',
          hashtags: ['#review', '#productreview', '#honest'],
          instructions: ['Show product in use', 'Share pros and cons', 'Add swipe-up link'],
          tips: ['Be authentic', 'Use polls and questions', 'Save to highlights']
        }
      ];
    }
  }

  static async getCaptionTemplates(): Promise<FlexibleCaptionTemplate[]> {
    try {
      const response = await fetch(`${this.baseURL}/captions`);
      if (!response.ok) throw new Error('Failed to fetch captions');
      
      const result = await response.json();
      
      if (result.captions && Array.isArray(result.captions)) {
        return result.captions;
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('Error fetching captions:', error);
      throw error;
    }
  }

  static async getMyContent(): Promise<{ content: UserContent[], total: number }> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      
      return {
        content: data.content?.map((item: any) => ({
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

  static async schedulePost(postData: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  static async createContent(contentData: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  static async saveTemplateOrder(templates: UnifiedContentTemplate[]): Promise<void> {
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

  static async saveCaptionOrder(captions: FlexibleCaptionTemplate[]): Promise<void> {
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

  // Modal states with proper typing
  const [modals, setModals] = useState<ModalStates>({
    preview: { isOpen: false, template: null },
    schedule: false,
    analytics: false,
    insights: false,
    postingTimes: false,
    createContent: { isOpen: false, template: null }
  });

  // Content data state
  const [contentStats, setContentStats] = useState<ContentStats>({
    totalPosts: 0,
    totalViews: '0',
    avgEngagement: '0%',
    contentEarnings: '₦0'
  });

  const [contentTemplates, setContentTemplates] = useState<UnifiedContentTemplate[]>([]);
  const [captionTemplates, setCaptionTemplates] = useState<FlexibleCaptionTemplate[]>([]);
  const [myContent, setMyContent] = useState<UserContent[]>([]);
  
  // Loading state tracking
  const [loadingStates, setLoadingStates] = useState({
    templates: false,
    captions: false,
    content: false,
    stats: false
  });

  const [dataLoaded, setDataLoaded] = useState({
    templates: false,
    captions: false,
    content: false,
    stats: false
  });

  // Modal handlers with improved type safety
  const openModal = (type: keyof ModalStates, template?: UnifiedContentTemplate) => {
    setModals(prev => ({
      ...prev,
      [type]: template !== undefined 
        ? { isOpen: true, template } 
        : type === 'preview' || type === 'createContent'
          ? { isOpen: true, template: null }
          : true
    }));
  };

  const closeModal = (type: keyof ModalStates) => {
    setModals(prev => ({
      ...prev,
      [type]: type === 'preview' || type === 'createContent' 
        ? { isOpen: false, template: null } 
        : false
    }));
  };

  // Data loading functions
  const loadContentStats = useCallback(async () => {
    if (loadingStates.stats || dataLoaded.stats) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }));
      setError(null);
      const stats = await ContentHubAPI.getContentStats();
      setContentStats(stats);
      setDataLoaded(prev => ({ ...prev, stats: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  }, [loadingStates.stats, dataLoaded.stats]);

  const loadContentTemplates = useCallback(async () => {
    if (loadingStates.templates || dataLoaded.templates) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, templates: true }));
      const templates = await ContentHubAPI.getContentTemplates();
      setContentTemplates(Array.isArray(templates) ? templates : []);
      setDataLoaded(prev => ({ ...prev, templates: true }));
    } catch (err) {
      console.error('Failed to load templates:', err);
      setContentTemplates([]);
      setError('Failed to load templates');
    } finally {
      setLoadingStates(prev => ({ ...prev, templates: false }));
    }
  }, [loadingStates.templates, dataLoaded.templates]);

  const loadCaptionTemplates = useCallback(async () => {
    if (loadingStates.captions || dataLoaded.captions) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, captions: true }));
      const captions = await ContentHubAPI.getCaptionTemplates();
      setCaptionTemplates(captions);
      setDataLoaded(prev => ({ ...prev, captions: true }));
    } catch (err) {
      console.error('Failed to load captions:', err);
      setError('Failed to load captions');
    } finally {
      setLoadingStates(prev => ({ ...prev, captions: false }));
    }
  }, [loadingStates.captions, dataLoaded.captions]);

  const loadMyContent = useCallback(async () => {
    if (loadingStates.content || dataLoaded.content) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, content: true }));
      const { content } = await ContentHubAPI.getMyContent();
      setMyContent(content);
      setDataLoaded(prev => ({ ...prev, content: true }));
    } catch (err) {
      console.error('Failed to load my content:', err);
      setError('Failed to load your content');
    } finally {
      setLoadingStates(prev => ({ ...prev, content: false }));
    }
  }, [loadingStates.content, dataLoaded.content]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    setError(null);
    
    switch (activeTab) {
      case 'templates':
        loadContentStats();
        loadContentTemplates();
        break;
      case 'my-content':
        loadMyContent();
        break;
      case 'captions':
        loadCaptionTemplates();
        break;
      case 'schedule':
        // Schedule tab doesn't need initial data loading
        break;
    }
  }, [activeTab, loadContentStats, loadContentTemplates, loadCaptionTemplates, loadMyContent]);

  // Event handlers
  const handleUseTemplate = async (template: UnifiedContentTemplate) => {
    openModal('createContent', template);
  };

  const handlePreviewTemplate = (template: UnifiedContentTemplate) => {
    openModal('preview', template);
  };

  const handleCreateContent = async (contentData: any) => {
    try {
      if (contentData.publishNow) {
        await ContentHubAPI.createContent(contentData);
        sharedUtils.showNotification('Content created successfully!', 'success');
      } else {
        await ContentHubAPI.schedulePost(contentData);
        sharedUtils.showNotification('Content scheduled successfully!', 'success');
      }
      closeModal('createContent');
      
      // Refresh content if on my-content tab
      if (activeTab === 'my-content') {
        setDataLoaded(prev => ({ ...prev, content: false }));
        loadMyContent();
      }
    } catch (error) {
      sharedUtils.showNotification('Failed to create content', 'error');
      throw error;
    }
  };

  const handleSchedulePost = async (postData: any) => {
    try {
      await ContentHubAPI.schedulePost(postData);
      sharedUtils.showNotification('Post scheduled successfully!', 'success');
      closeModal('schedule');
    } catch (error) {
      sharedUtils.showNotification('Failed to schedule post', 'error');
      throw error;
    }
  };

  const handleCopyCaption = async (caption: FlexibleCaptionTemplate) => {
    const fullCaption = `${caption.content}\n\n${caption.hashtags.join(' ')}`;
    const success = await sharedUtils.copyToClipboard(fullCaption);
    if (success) {
      sharedUtils.showNotification('Caption copied to clipboard', 'success');
    } else {
      sharedUtils.showNotification('Failed to copy caption', 'error');
    }
  };

  const handleReorderTemplates = async (newOrder: UnifiedContentTemplate[]) => {
    const previousOrder = [...contentTemplates];
    setContentTemplates(newOrder);
    
    try {
      await ContentHubAPI.saveTemplateOrder(newOrder);
      sharedUtils.showNotification('Template order updated', 'success');
    } catch (error) {
      setContentTemplates(previousOrder);
      sharedUtils.showNotification('Failed to update template order', 'error');
    }
  };

  const handleReorderCaptions = async (newOrder: FlexibleCaptionTemplate[]) => {
    const previousOrder = [...captionTemplates];
    setCaptionTemplates(newOrder);
    
    try {
      await ContentHubAPI.saveCaptionOrder(newOrder);
      sharedUtils.showNotification('Caption order updated', 'success');
    } catch (error) {
      setCaptionTemplates(previousOrder);
      sharedUtils.showNotification('Failed to update caption order', 'error');
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'templates' as ContentTabType, label: 'Content Templates', icon: Camera },
    { id: 'my-content' as ContentTabType, label: 'My Content', icon: Users },
    { id: 'captions' as ContentTabType, label: 'Caption Templates', icon: Edit },
    { id: 'schedule' as ContentTabType, label: 'Content Calendar', icon: Calendar }
  ];

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return (
          <div className="p-4 md:p-6">
            {loadingStates.stats && <LoadingSpinner message="Loading stats..." />}
            {error && <ErrorState message={error} onRetry={() => {
              setError(null);
              setDataLoaded(prev => ({ ...prev, stats: false, templates: false }));
              loadContentStats();
              loadContentTemplates();
            }} />}
            {!loadingStates.stats && !error && (
              <>
                <ContentStatsGrid stats={contentStats} />
                <div className="mt-6">
                  <EnhancedContentTemplates 
                    templates={contentTemplates as any}
                    onUseTemplate={handleUseTemplate}
                    onPreviewTemplate={handlePreviewTemplate}
                    onReorderTemplates={handleReorderTemplates as any}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'my-content':
        return (
          <div className="p-4 md:p-6">
            {loadingStates.content && <LoadingSpinner message="Loading your content..." />}
            {!loadingStates.content && (
              <MyContent 
                content={myContent}
                onAddNewPost={() => openModal('createContent')}
              />
            )}
          </div>
        );

      case 'captions':
        return (
          <div className="p-4 md:p-6">
            {loadingStates.captions && <LoadingSpinner message="Loading captions..." />}
            {!loadingStates.captions && (
             <EnhancedCaptionTemplates 
                  captions={captionTemplates}
                  onCopyCaption={handleCopyCaption}
                  onReorderCaptions={handleReorderCaptions} // Optional - enables drag and drop
                />
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="p-4 md:p-6">
            <ContentCalendar               
              onSchedulePost={() => openModal('schedule')}
              scheduledContent={[]}
              onEditScheduled={(postId) => console.log('Edit:', postId)}
              onDeleteScheduled={(postId) => console.log('Delete:', postId)}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Hub</h2>
          <p className="text-gray-600">Manage your content templates, posts, and scheduling</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => openModal('insights')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 justify-center sm:justify-start"
          >
            <TrendingUp className="h-4 w-4" />
            Insights
          </button>
          <button 
            onClick={() => openModal('postingTimes')}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2 justify-center sm:justify-start"
          >
            <Clock className="h-4 w-4" />
            Best Times
          </button>
          <button 
            onClick={() => openModal('analytics')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 justify-center sm:justify-start"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button 
            onClick={() => openModal('createContent')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4" />
            Create Content
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <MobileSliderNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Modals */}
      <PreviewModal
        template={modals.preview.template as any}
        isOpen={modals.preview.isOpen}
        onClose={() => closeModal('preview')}
        onUse={handleUseTemplate}
      />

      <SchedulePostModal
        isOpen={modals.schedule}
        onClose={() => closeModal('schedule')}
        onSchedule={handleSchedulePost}
      />

      <AnalyticsModal
        isOpen={modals.analytics}
        onClose={() => closeModal('analytics')}
      />

      <ContentInsightsModal
        isOpen={modals.insights}
        onClose={() => closeModal('insights')}
      />

      <PostingTimesModal
        isOpen={modals.postingTimes}
        onClose={() => closeModal('postingTimes')}
      />

      <CreateContentModal
        isOpen={modals.createContent.isOpen}
        onClose={() => closeModal('createContent')}
        onCreate={handleCreateContent}
        selectedTemplate={modals.createContent.template as any}
      />
    </div>
  );
};

// Loading and Error Components
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    <span className="ml-3 text-gray-600">{message}</span>
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