"use client"
import React, { useState } from 'react';
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight, Edit, Trash2, Instagram, Music } from 'lucide-react';
import { ContentCalendarProps } from '@/types/Creatortypes/contentHub';

interface ScheduledPost {
  id: string;
  title: string;
  platform: 'Instagram' | 'TikTok';
  type: 'Post' | 'Story' | 'Reel' | 'Video';
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'draft';
  caption?: string;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ 
  onSchedulePost,
  scheduledContent = [],
  onEditScheduled,
  onDeleteScheduled 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Mock scheduled posts for demonstration
  const mockScheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      title: 'Grocery Haul Video',
      platform: 'Instagram',
      type: 'Reel',
      scheduledDate: '2025-09-06',
      scheduledTime: '09:00',
      status: 'scheduled',
      caption: 'Fresh groceries for the week!'
    },
    {
      id: '2',
      title: 'Recipe Tutorial',
      platform: 'TikTok',
      type: 'Video',
      scheduledDate: '2025-09-08',
      scheduledTime: '14:30',
      status: 'scheduled',
      caption: 'Easy weeknight dinner recipe'
    },
    {
      id: '3',
      title: 'Product Review',
      platform: 'Instagram',
      type: 'Post',
      scheduledDate: '2025-09-10',
      scheduledTime: '11:00',
      status: 'draft',
      caption: 'Honest review of this kitchen gadget'
    }
  ];

  const scheduledPosts = scheduledContent.length > 0 ? scheduledContent.map(content => ({
    id: content.id,
    title: content.title,
    platform: content.platform,
    type: content.type,
    scheduledDate: content.posted, // Assuming this contains scheduled date
    scheduledTime: '09:00', // Default time
    status: content.status || 'scheduled' as const,
    caption: content.title
  })) : mockScheduledPosts;

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
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const postsForDate = getPostsForDate(date);
      const isCurrentDay = isToday(date);
      
      days.push(
        <div 
          key={date} 
          className={`h-24 border border-gray-100 p-1 relative ${
            isCurrentDay ? 'bg-orange-50 border-orange-200' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {date}
          </div>
          
          {postsForDate.length > 0 && (
            <div className="space-y-1">
              {postsForDate.slice(0, 2).map(post => (
                <div 
                  key={post.id}
                  className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${
                    post.platform === 'Instagram' 
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  onClick={() => onEditScheduled?.(post.id)}
                  title={`${post.title} - ${post.scheduledTime}`}
                >
                  <div className="flex items-center gap-1">
                    {post.platform === 'Instagram' ? (
                      <Instagram className="h-3 w-3" />
                    ) : (
                      <Music className="h-3 w-3" />
                    )}
                    <span className="truncate">{post.title}</span>
                  </div>
                </div>
              ))}
              {postsForDate.length > 2 && (
                <div className="text-xs text-gray-500">
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
      .filter(post => new Date(post.scheduledDate) >= today)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Upcoming Posts</h4>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming posts scheduled</p>
        ) : (
          upcoming.map(post => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                <div>
                  <h5 className="font-medium text-sm text-gray-900">{post.title}</h5>
                  <p className="text-xs text-gray-500">
                    {new Date(post.scheduledDate).toLocaleDateString()} at {post.scheduledTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEditScheduled(post.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onDeleteScheduled(post.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
          <p className="text-sm text-gray-600">Plan and schedule your content for maximum engagement</p>
        </div>
        <button 
          onClick={onSchedulePost}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {monthNames[month]} {year}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      view === 'month' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      view === 'week' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
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
            <div className="p-4">
              <div className="grid grid-cols-7 gap-0 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">This Month</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled Posts</span>
                <span className="font-semibold text-gray-900">{scheduledPosts.length}</span>
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
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {renderUpcomingPosts()}
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
                Optimal times
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;