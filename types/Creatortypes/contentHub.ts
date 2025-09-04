// Content template interface
export interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  platform: 'Instagram' | 'TikTok' | 'Both';
  type: 'video' | 'image';
  duration: string;
  tags: string[];
  engagement: 'Low' | 'Medium' | 'High' | 'Very High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  previewUrl?: string;
  thumbnailUrl?: string;
  instructions?: string[]; // Changed from boolean to string array
}

// User content interface
export interface UserContent {
  id: string;
  title: string;
  platform: 'Instagram' | 'TikTok';
  type: 'Post' | 'Story' | 'Reel' | 'Video';
  posted: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  earnings: string;
  thumbnailUrl?: string;
  postUrl?: string;
}

// Caption template interface
export interface CaptionTemplate {
  id: string;
  title: string;
  platform: 'Instagram' | 'TikTok' | 'Both';
  content: string;
  hashtags: string[];
  category: string;
}

// Content stats interface
export interface ContentStats {
  totalPosts: number;
  totalViews: string;
  avgEngagement: string;
  contentEarnings: string;
}

// Tab type
export type ContentTabType = 'templates' | 'my-content' | 'captions' | 'schedule';

// Component props interfaces
export interface TabButtonProps {
  id: ContentTabType;
  label: string;
  isActive: boolean;
  onClick: (id: ContentTabType) => void;
}

export interface EngagementBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface DifficultyBadgeProps {
  level: 'Easy' | 'Medium' | 'Hard';
}

export interface ContentStatsGridProps {
  stats: ContentStats;
}

export interface ContentTemplatesProps {
  templates?: ContentTemplate[];
  onUseTemplate: (template: ContentTemplate) => void;
  onPreviewTemplate: (template: ContentTemplate) => void;
}

export interface MyContentProps {
  content: UserContent[];
  onAddNewPost: () => void;
}

export interface CaptionTemplatesProps {
  captions: CaptionTemplate[];
  onCopyCaption: (caption: CaptionTemplate) => void;
}

export interface ContentCalendarProps {
  onSchedulePost: () => void;
}

export interface ContentHubHeaderProps {
  totalPosts: number;
}
// Add these interfaces to your existing types
export interface TemplateOrderItem {
  id: string;
  order: number;
}

export interface CaptionOrderItem {
  id: string;
  order: number;
}

export interface DashboardLayout {
  sidebarCollapsed?: boolean;
  theme?: 'light' | 'dark';
  gridView?: 'card' | 'list';
}

export interface ContentFilters {
  platform?: string;
  type?: string;
  difficulty?: string;
  engagement?: string;
}