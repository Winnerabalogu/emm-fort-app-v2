
"use client";
import React, { useState } from 'react';
import { X, Eye, Heart, MessageCircle, Share2, BarChart3,  Target,  Users } from 'lucide-react';

// Analytics Modal
interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  if (!isOpen) return null;

  const analyticsData = {
    overview: {
      totalViews: 125420,
      totalLikes: 8945,
      totalComments: 1256,
      totalShares: 423,
      engagementRate: 8.2,
      followerGrowth: 12.5
    },
    topPosts: [
      {
        id: '1',
        title: 'Grocery Haul Video',
        platform: 'Instagram',
        type: 'Reel',
        views: 45200,
        likes: 3200,
        comments: 180,
        shares: 95,
        date: '2025-09-15'
      },
      {
        id: '2',
        title: 'Recipe Tutorial',
        platform: 'TikTok',
        type: 'Video',
        views: 32100,
        likes: 2100,
        comments: 95,
        shares: 67,
        date: '2025-09-12'
      },
      {
        id: '3',
        title: 'Product Review',
        platform: 'Instagram',
        type: 'Post',
        views: 18900,
        likes: 1200,
        comments: 78,
        shares: 34,
        date: '2025-09-10'
      }
    ],
    platformBreakdown: [
      { platform: 'Instagram', percentage: 65, color: 'bg-pink-500' },
      { platform: 'TikTok', percentage: 35, color: 'bg-gray-900' }
    ],
    weeklyData: [
      { day: 'Mon', views: 12000, engagement: 7.2 },
      { day: 'Tue', views: 15000, engagement: 8.1 },
      { day: 'Wed', views: 18000, engagement: 9.3 },
      { day: 'Thu', views: 14000, engagement: 7.8 },
      { day: 'Fri', views: 22000, engagement: 10.2 },
      { day: 'Sat', views: 25000, engagement: 11.5 },
      { day: 'Sun', views: 19000, engagement: 8.9 }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Content Analytics</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    timeRange === range 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Views</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.overview.totalViews.toLocaleString()}</p>
              <p className="text-xs text-blue-700">+15% vs last period</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Likes</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{analyticsData.overview.totalLikes.toLocaleString()}</p>
              <p className="text-xs text-green-700">+8% vs last period</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Comments</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.overview.totalComments.toLocaleString()}</p>
              <p className="text-xs text-purple-700">+22% vs last period</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Shares</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{analyticsData.overview.totalShares.toLocaleString()}</p>
              <p className="text-xs text-orange-700">+31% vs last period</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Engagement</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{analyticsData.overview.engagementRate}%</p>
              <p className="text-xs text-indigo-700">+2.1% vs last period</p>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-900">Growth</span>
              </div>
              <p className="text-2xl font-bold text-pink-900">{analyticsData.overview.followerGrowth}%</p>
              <p className="text-xs text-pink-700">+5.2% vs last period</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Weekly Performance</h3>
              <div className="space-y-4">
                {analyticsData.weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(day.views / 25000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{day.views.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 block">{day.engagement}% eng</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Distribution</h3>
              <div className="space-y-4">
                {analyticsData.platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{platform.platform}</span>
                      <span className="text-sm text-gray-600">{platform.percentage}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${platform.color} h-2 rounded-full`}
                        style={{ width: `${platform.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Insights</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instagram Reels perform 40% better than posts</li>
                  <li>• TikTok engagement peaks on weekends</li>
                  <li>• Cross-platform posting increases reach by 25%</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Performing Content</h3>
            <div className="space-y-4">
              {analyticsData.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-600">{post.platform} • {post.type} • {post.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{post.views.toLocaleString()}</p>
                      <p className="text-gray-600">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{post.likes.toLocaleString()}</p>
                      <p className="text-gray-600">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{((post.likes + post.comments + post.shares) / post.views * 100).toFixed(1)}%</p>
                      <p className="text-gray-600">Engagement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AnalyticsModal};