"use client";
import React, { useState } from 'react';
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight, Edit, Trash2, Instagram, Music, Eye, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'Instagram' | 'TikTok';
  type: 'Post' | 'Story' | 'Reel' | 'Video';
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'draft';
  caption?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface ContentCalendarProps {
  onSchedulePost: () => void;
  scheduledContent?: ScheduledPost[];
  onEditScheduled: (postId: string) => void;
  onDeleteScheduled: (postId: string) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ 
  onSchedulePost,
  scheduledContent = [],
  onEditScheduled,
  onDeleteScheduled 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  // Mock scheduled posts for demonstration
  const mockScheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      title: 'Grocery Haul Video',
      platform: 'Instagram',
      type: 'Reel',
      scheduledDate: '2025-09-22',
      scheduledTime: '09:00',
      status: 'scheduled',
      caption: 'Fresh groceries for the week! Check out what made it into my cart 🛒',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: '2',
      title: 'Recipe Tutorial',
      platform: 'TikTok',
      type: 'Video',
      scheduledDate: '2025-09-24',
      scheduledTime: '14:30',
      status: 'scheduled',
      caption: 'Easy weeknight dinner recipe that saves time ⏰',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: '3',
      title: 'Product Review',
      platform: 'Instagram',
      type: 'Post',
      scheduledDate: '2025-09-26',
      scheduledTime: '11:00',
      status: 'draft',
      caption: 'Honest review of this amazing kitchen gadget',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: '4',
      title: 'Behind the Scenes',
      platform: 'Instagram',
      type: 'Story',
      scheduledDate: '2025-09-23',
      scheduledTime: '16:00',
      status: 'published',
      caption: 'Quick behind the scenes of content creation',
      views: 1250,
      likes: 89,
      comments: 12,
      shares: 5
    }
  ];

  const scheduledPosts = scheduledContent.length > 0 ? scheduledContent : mockScheduledPosts;

  // Calendar logic
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  const getPostsForDate = (date: number) => {
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    return scheduledPosts.filter(post => post.scheduledDate === dateString);
  };

  const isToday = (date: number) => {
    return today.getDate() === date && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 md:h-24 border border-gray-100"></div>);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const postsForDate = getPostsForDate(date);
      const isCurrentDay = isToday(date);
      
      days.push(
        <div 
          key={date} 
          className={`h-20 md:h-24 border border-gray-100 p-1 relative ${
            isCurrentDay ? 'bg-orange-50 border-orange-200' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-xs md:text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {date}
          </div>
          
          {postsForDate.length > 0 && (
            <div className="space-y-1">
              {postsForDate.slice(0, view === 'month' ? 2 : 3).map(post => (
                <div 
                  key={post.id}
                  className={`text-xs px-1 md:px-2 py-1 rounded truncate cursor-pointer transition-all ${
                    post.platform === 'Instagram' 
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${post.status === 'draft' ? 'opacity-70 border border-dashed border-gray-400' : ''}`}
                  onClick={() => setSelectedPost(post)}
                  title={`${post.title} - ${post.scheduledTime}`}
                >
                  <div className="flex items-center gap-1">
                    {post.platform === 'Instagram' ? (
                      <Instagram className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
                    ) : (
                      <Music className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
                    )}
                    <span className="truncate text-xs">{post.title}</span>
                  </div>
                </div>
              ))}
              {postsForDate.length > 2 && (
                <div className="text-xs text-gray-500 px-1">
                  +{postsForDate.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const renderUpcomingPosts = () => {
    const upcoming = scheduledPosts
      .filter(post => new Date(post.scheduledDate) >= today && post.status !== 'published')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Upcoming Posts</h4>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming posts scheduled</p>
        ) : (
          upcoming.map(post => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  post.platform === 'Instagram' ? 'bg-pink-100' : 'bg-gray-900'
                }`}>
                  {post.platform === 'Instagram' ? (
                    <Instagram className={`h-4 w-4 ${
                      post.platform === 'Instagram' ? 'text-pink-600' : 'text-white'
                    }`} />
                  ) : (
                    <Music className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-medium text-sm text-gray-900 truncate">{post.title}</h5>
                  <p className="text-xs text-gray-500">
                    {new Date(post.scheduledDate).toLocaleDateString()} at {post.scheduledTime}
                  </p>
                  {post.status === 'draft' && (
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full mt-1">
                      Draft
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onEditScheduled(post.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onDeleteScheduled(post.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderRecentPerformance = () => {
    const published = scheduledPosts.filter(post => post.status === 'published');
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Recent Performance</h4>
        {published.length === 0 ? (
          <p className="text-sm text-gray-500">No published posts yet</p>
        ) : (
          published.slice(0, 3).map(post => (
            <div key={post.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                {post.platform === 'Instagram' ? (
                  <Instagram className="h-4 w-4 text-pink-600" />
                ) : (
                  <Music className="h-4 w-4 text-gray-900" />
                )}
                <h5 className="font-medium text-sm text-gray-900">{post.title}</h5>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Eye className="h-3 w-3" />
                  <span>{post.views?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="h-3 w-3" />
                  <span>{post.likes?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="h-3 w-3" />
                  <span>{post.comments?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Share2 className="h-3 w-3" />
                  <span>{post.shares?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
          <p className="text-sm text-gray-600">Plan and schedule your content for maximum engagement</p>
        </div>
        <button 
          onClick={onSchedulePost}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start"
        >
          <Plus className="h-4 w-4" />
          Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Calendar - Takes 3 columns on xl screens */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {monthNames[month]} {year}
                </h4>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === 'month' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === 'week' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-2 md:p-4">
              <div className="grid grid-cols-7 gap-0 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 2)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Takes 1 column on xl screens */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">This Month</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="font-semibold text-blue-600">
                  {scheduledPosts.filter(p => p.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published</span>
                <span className="font-semibold text-green-600">
                  {scheduledPosts.filter(p => p.status === 'published').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Drafts</span>
                <span className="font-semibold text-amber-600">
                  {scheduledPosts.filter(p => p.status === 'draft').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="font-semibold text-purple-600">
                  {scheduledPosts.reduce((sum, post) => sum + (post.views || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {renderUpcomingPosts()}
          </div>

          {/* Recent Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {renderRecentPerformance()}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={onSchedulePost}
                className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                Schedule new post
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <Calendar className="h-4 w-4" />
                View analytics
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <Clock className="h-4 w-4" />
                Best posting times
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <TrendingUp className="h-4 w-4" />
                Content insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedPost.platform === 'Instagram' ? (
                  <Instagram className="h-5 w-5 text-pink-600" />
                ) : (
                  <Music className="h-5 w-5 text-gray-900" />
                )}
                <h3 className="font-semibold text-gray-900">{selectedPost.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scheduled for:</p>
                <p className="font-medium">{new Date(selectedPost.scheduledDate).toLocaleDateString()} at {selectedPost.scheduledTime}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Type:</p>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {selectedPost.type}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Status:</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                  selectedPost.status === 'published' ? 'bg-green-100 text-green-700' :
                  selectedPost.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedPost.status}
                </span>
              </div>

              {selectedPost.caption && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Caption:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedPost.caption}</p>
                </div>
              )}

              {selectedPost.status === 'published' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{selectedPost.views?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{selectedPost.likes?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-600">Likes</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    onEditScheduled(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    onDeleteScheduled(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;