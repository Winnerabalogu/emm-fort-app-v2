/* eslint-disable @typescript-eslint/no-unused-vars */
// app/creator/analytics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface ContentMetrics {
  id: string;
  title: string;
  platform: string;
  type: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  earnings: number;
  publishedAt: string;
  engagement: number;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalEarnings: number;
  averageEngagement: number;
  topPerformingContent: ContentMetrics[];
  platformBreakdown: {
    platform: string;
    posts: number;
    views: number;
    earnings: number;
  }[];
  dailyStats: {    
    date: string;
    views: number;
    earnings: number;
  }[];
  engagementTrend: number;
  period: string;
}

const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  colorClass 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  colorClass: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {change && (
        <span className={`text-sm font-medium ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ContentTable = ({ content }: { content: ContentMetrics[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {content.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xs">{item.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  item.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                  item.platform === 'tiktok' ? 'bg-gray-900 text-white' :
                  item.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.platform}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {item.views.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{item.engagement.toFixed(1)}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(item.engagement * 2, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                ₦{item.earnings.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PlatformChart = ({ data }: { data: AnalyticsData['platformBreakdown'] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
    <div className="space-y-4">
      {data.map((platform, index) => {
        const maxEarnings = Math.max(...data.map(p => p.earnings));
        const percentage = maxEarnings > 0 ? (platform.earnings / maxEarnings) * 100 : 0;
        
        return (
          <div key={platform.platform} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 capitalize">{platform.platform}</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₦{platform.earnings.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{platform.posts} posts</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  index === 0 ? 'bg-pink-500' :
                  index === 1 ? 'bg-gray-800' :
                  index === 2 ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function CreatorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/creator/analytics?period=${period}`);
        if (!response.ok) {
          throw new Error('Failed to load analytics');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Period Selector */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-purple-100">Track your content performance and earnings</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p 
                    ? 'bg-white text-purple-600 font-medium' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Eye}
          label="Total Views"
          value={data.totalViews.toLocaleString()}
          change={`+${data.engagementTrend}%`}
          colorClass="bg-blue-500"
        />
        <MetricCard
          icon={Heart}
          label="Total Likes"
          value={data.totalLikes.toLocaleString()}
          change="+12.5%"
          colorClass="bg-red-500"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Earnings"
          value={`₦${data.totalEarnings.toLocaleString()}`}
          change="+8.3%"
          colorClass="bg-green-500"
        />
        <MetricCard
          icon={Activity}
          label="Avg. Engagement"
          value={`${data.averageEngagement.toFixed(1)}%`}
          change="+2.1%"
          colorClass="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Performance</h3>
          <div className="space-y-4">
            {data.dailyStats.slice(0, 7).map((stat) => (
              <div key={stat.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.date}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{stat.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">₦{stat.earnings.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Performance */}
        <PlatformChart data={data.platformBreakdown} />
      </div>

      {/* Top Performing Content */}
      <ContentTable content={data.topPerformingContent} />

      {/* Insights & Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Performance Highlights</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Engagement Up 15%</p>
                  <p className="text-xs text-green-600">Your content is resonating well with audiences</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Best Platform: {data.platformBreakdown[0]?.platform}</p>
                  <p className="text-xs text-blue-600">Focus your efforts here for maximum impact</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Optimization Tips</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Post Consistently</p>
                  <p className="text-xs text-amber-600">Regular posting can increase engagement by up to 30%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Engage with Comments</p>
                  <p className="text-xs text-purple-600">Responding to comments boosts algorithmic reach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}