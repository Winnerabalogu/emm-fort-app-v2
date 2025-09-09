/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Info,
  BarChart2,
  Lightbulb,
  Star,
  MessageSquare
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

interface PlatformBreakdown {
  platform: string;
  posts: number;
  views: number;
  earnings: number;
  averageViewsPerPost: number;
  averageEarningsPerPost: number;
  engagementRate: number;
}

interface DailyStat {
  date: string;
  views: number;
  earnings: number;
  likes: number;
  comments: number;
}
interface InsightsPanelProps {
  data: {
    bestPerformingPlatform: string | null;
    averagePostsPerDay: number;
    topEngagementPost: {
      id: string;
      title: string;
      engagement: number;
      platform: string;
    } | null;
    totalReach: number;
    conversionRate: number;
  } | null;
  isLoading: boolean;
}
interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalEarnings: number;
  totalPosts: number;
  averageEngagement: number;
  topPerformingContent: ContentMetrics[];
  platformBreakdown: PlatformBreakdown[];
  dailyStats: DailyStat[];
  trends: {
    views: number;
    earnings: number;
    engagement: number;
  };
  insights: {
    bestPerformingPlatform: string | null;
    averagePostsPerDay: number;
    topEngagementPost: ContentMetrics | null;
    totalReach: number;
    conversionRate: number;
  };
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  metadata: {
    lastUpdated: string;
    dataPoints: number;
    hasPartialData: boolean;
  };
}

const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  colorClass,
  isLoading = false,
  subtitle
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: number;
  colorClass: string;
  isLoading?: boolean;
  subtitle?: string;
}) => {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-4 w-4" />;
    return change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass} ${isLoading ? 'animate-pulse' : ''}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        {isLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const ContentTable = ({ content, isLoading }: { content: ContentMetrics[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <Download className="h-5 w-5" />
        </button>
      </div>
      
      {content.length === 0 ? (
        <div className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No published content found for this period</p>
          <p className="text-sm text-gray-400 mt-1">Start creating and publishing content to see analytics</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {content.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate max-w-xs" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      item.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      item.platform === 'tiktok' ? 'bg-gray-900 text-white' :
                      item.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                      item.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.views.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium">{item.engagement}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.engagement >= 5 ? 'bg-green-500' :
                            item.engagement >= 2 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(item.engagement * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.earnings)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

type PlatformChartProps = {
  data: {
    platform: string;
    earnings: number;
    posts: number;
    averageViewsPerPost: number;
    engagementRate: number;
  }[];
  isLoading: boolean;
  view: "daily" | "weekly" | "monthly"; // 👈 add this
};

const PlatformChart: React.FC<PlatformChartProps> = ({ data, isLoading, view }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxEarnings =
    data.length > 0 ? Math.max(...data.map((p) => p.earnings)) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Platform Performance
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          <span>{view} view</span> {/* 👈 show active view */}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No platform data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((platform, index) => {
            const percentage =
              maxEarnings > 0
                ? (platform.earnings / maxEarnings) * 100
                : 0;

            return (
              <div key={platform.platform} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0
                          ? "bg-pink-500"
                          : index === 1
                          ? "bg-gray-800"
                          : index === 2
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <span className="font-medium text-gray-900 capitalize">
                      {platform.platform}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(platform.earnings)}
                    </p>
                    <p className="text-sm text-gray-500">{platform.posts} posts</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0
                        ? "bg-pink-500"
                        : index === 1
                        ? "bg-gray-800"
                        : index === 2
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{platform.averageViewsPerPost} avg views</span>
                  <span>{platform.engagementRate}% engagement</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const InsightsPanel = ({ data, isLoading }: InsightsPanelProps) => {
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <div key={item} className="p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        Key Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Star className="h-4 w-4 text-indigo-500" />
              Best Performing Platform
            </div>
            <p className="text-lg font-medium text-gray-900">
              {data.bestPerformingPlatform || "No data"}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Avg. Posts Per Day
            </div>
            <p className="text-lg font-medium text-gray-900">
              {data.averagePostsPerDay}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Target className="h-4 w-4 text-purple-500" />
              Top Engagement Post
            </div>
            {data.topEngagementPost ? (
              <div>
                <p className="text-gray-900 font-medium truncate">
                  {data.topEngagementPost.title}
                </p>
                <p className="text-sm text-gray-600">
                  {data.topEngagementPost.engagement}% engagement on{" "}
                  {data.topEngagementPost.platform}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No data</p>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <BarChart2 className="h-4 w-4 text-blue-500" />
              Conversion Rate
            </div>
            <p className="text-sm font-medium text-gray-900">
              {data.conversionRate.toFixed(2)} per 1k views
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


type DailyMetric = "views" | "likes" | "comments" | "earnings";

interface DailyStats {
  date: string;
  views: number;
  likes: number;
  comments: number;
  earnings: number;
}

const DailyPerformance = ({ dailyStats }: { dailyStats: DailyStats[] }) => {
  const [metric, setMetric] = useState<DailyMetric>("views");

  const metricConfig: Record<
    DailyMetric,
    { label: string; icon: React.ElementType; color: string; format: (v: number) => string }
  > = {
    views: {
      label: "Views",
      icon: Eye,
      color: "text-blue-500",
      format: (v) => v.toLocaleString(),
    },
    likes: {
      label: "Likes",
      icon: Heart,
      color: "text-red-500",
      format: (v) => v.toLocaleString(),
    },
    comments: {
      label: "Comments",
      icon: MessageSquare,
      color: "text-indigo-500",
      format: (v) => v.toLocaleString(),
    },
    earnings: {
      label: "Earnings",
      icon: DollarSign,
      color: "text-green-500",
      format: (v) => `₦${v.toFixed(0)}`,
    },
  };

  const ActiveIcon = metricConfig[metric].icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Daily Performance</h3>
        <div className="flex gap-2">
          {(Object.keys(metricConfig) as DailyMetric[]).map((key) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`px-2 py-1 text-sm rounded ${
                metric === key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {metricConfig[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {dailyStats.slice(0, 7).map((stat) => (
          <div
            key={stat.date}
            className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-600">{stat.date}</span>
            <div className="flex items-center gap-2">
              <ActiveIcon className={`h-4 w-4 ${metricConfig[metric].color}`} />
              <span className="text-sm font-medium">
                {metricConfig[metric].format(stat[metric])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default function CreatorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
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

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-purple-100">Track your content performance</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  period === p 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Eye}
          label="Total Views"
          value={data.totalViews.toLocaleString()}
          change={data.averageEngagement}
          colorClass="bg-blue-500"
        />
        <MetricCard
          icon={Heart}
          label="Total Likes"
          value={data.totalLikes.toLocaleString()}
          colorClass="bg-red-500"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Earnings"
          value={`₦${data.totalEarnings.toLocaleString()}`}
          colorClass="bg-green-500"
        />
        <MetricCard
          icon={Activity}
          label="Avg. Engagement"
          value={`${data.averageEngagement.toFixed(1)}%`}
          colorClass="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <DailyPerformance dailyStats={data.dailyStats} />


        {/* Platform Performance */}
        <PlatformChart 
  data={data.platformBreakdown} 
  isLoading={false} 
  view="daily" 
/>

      </div>

      {/* Top Performing Content */}
      <ContentTable content={data.topPerformingContent} isLoading={false} />

      {/* Simple Insights */}
     <InsightsPanel data={data.insights} isLoading={false}/>
    </div>
  );
}