/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/creator/analytics/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format, endOfDay, isValid } from 'date-fns';
import { z } from 'zod';

// Input validation schema
const QuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('7d'),
  timezone: z.string().optional()
});

// Type definitions for better type safety
interface PlatformBreakdown {
  platform: string;
  posts: number;
  views: number;
  earnings: number;
 likes: number;
  comments: number;
}

interface DailyAnalytic {
  date: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  earnings: number;
}

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

export async function GET(request: Request) {
  try {
    // Authentication & Authorization
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.isCreator) {
      return NextResponse.json(
        { error: 'Creator access required' },
        { status: 403 }
      );
    }

    // Input validation
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    const validationResult = QuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: validationResult.error
        },
        { status: 400 }
      );
    }

    const { period } = validationResult.data;
    const userId = session.user.id;

    // Calculate date range with proper timezone handling
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days));

    // Parallel data fetching with error handling
    const [
      contentPosts,
      totalMetrics,
      platformBreakdown,
      dailyAnalytics,
      previousPeriodMetrics
    ] = await Promise.allSettled([
      // Top performing content posts
      prisma.contentPost.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          platform: true,
          type: true,
          views: true,
          likes: true,
          comments: true,
          shares: true,
          earnings: true,
          publishedAt: true,
          createdAt: true
        },
        orderBy: [
          { views: 'desc' },
          { earnings: 'desc' }
        ],
        take: 10
      }),

      // Total aggregated metrics
      prisma.contentPost.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
          status: 'PUBLISHED'
        },
        _sum: {
          views: true,
          likes: true,
          comments: true,
          shares: true,
          earnings: true
        },
        _count: {
          id: true
        }
      }),

      // Platform performance breakdown
      prisma.$queryRaw`
        SELECT 
          platform,
          COUNT(*)::int as posts,
          COALESCE(SUM(views), 0)::int as views,
          COALESCE(SUM(earnings), 0)::float as earnings,
          COALESCE(SUM(likes), 0)::int as likes,
          COALESCE(SUM(comments), 0)::int as comments
        FROM "ContentPost"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
          AND "status" = 'PUBLISHED'
        GROUP BY platform
        ORDER BY earnings DESC, views DESC
      ` as Promise<PlatformBreakdown[]>,

      // Daily analytics data
      prisma.contentAnalytics.findMany({
        where: {
          contentPost: {
            userId,
            status: 'PUBLISHED'
          },
          date: { gte: startDate, lte: endDate }
        },
        select: {
          date: true,
          views: true,
          likes: true,
          comments: true,
          shares: true,
          earnings: true
        },
        orderBy: { date: 'asc' }
      }),

      // Previous period metrics for trend calculation
      prisma.contentPost.aggregate({
        where: {
          userId,
          createdAt: { 
            gte: startOfDay(subDays(startDate, days)),
            lt: startDate
          },
          status: 'PUBLISHED'
        },
        _sum: {
          views: true,
          earnings: true
        }
      })
    ]);

    // Handle any failed promises
    const errors = [contentPosts, totalMetrics, platformBreakdown, dailyAnalytics, previousPeriodMetrics]
      .map((result, index) => result.status === 'rejected' ? { index, error: result.reason } : null)
      .filter(Boolean);

    if (errors.length > 0) {
      console.error('Analytics API errors:', errors);
    }

    // Extract successful results with fallbacks
    const posts = contentPosts.status === 'fulfilled' ? contentPosts.value : [];
    const metrics = totalMetrics.status === 'fulfilled' ? totalMetrics.value : {
      _sum: { views: 0, likes: 0, comments: 0, shares: 0, earnings: 0 },
      _count: { id: 0 }
    };
    const platforms = platformBreakdown.status === 'fulfilled' ? platformBreakdown.value : [];
    const analytics = dailyAnalytics.status === 'fulfilled' ? dailyAnalytics.value : [];
    const prevMetrics = previousPeriodMetrics.status === 'fulfilled' ? previousPeriodMetrics.value : {
      _sum: { views: 0, earnings: 0 }
    };

    // Process content metrics with proper engagement calculation
    const topPerformingContent: ContentMetrics[] = posts.map(post => {
      const totalInteractions = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
      const engagement = post.views && post.views > 0 
        ? Math.min((totalInteractions / post.views) * 100, 100) // Cap at 100%
        : 0;
      
      return {
        id: post.id,
        title: post.title || 'Untitled Post',
        platform: post.platform,
        type: post.type,
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        earnings: Number((post.earnings || 0).toFixed(2)),
        publishedAt: (post.publishedAt || post.createdAt).toISOString(),
        engagement: Number(engagement.toFixed(2))
      };
    });

    // Generate comprehensive daily stats
    const dailyStatsMap = new Map<string, { 
      views: number; 
      earnings: number; 
      likes: number; 
      comments: number; 
    }>();
    
    // Initialize all days in period
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      dailyStatsMap.set(date, { views: 0, earnings: 0, likes: 0, comments: 0 });
    }

    // Populate with actual analytics data
    analytics.forEach(stat => {
      const dateKey = format(stat.date, 'MMM dd');
      const existing = dailyStatsMap.get(dateKey) || { views: 0, earnings: 0, likes: 0, comments: 0 };
      
      dailyStatsMap.set(dateKey, {
        views: existing.views + (stat.views || 0),
        earnings: existing.earnings + (stat.earnings || 0),
        likes: existing.likes + (stat.likes || 0),
        comments: existing.comments + (stat.comments || 0)
      });
    });

    const dailyStats = Array.from(dailyStatsMap, ([date, stats]) => ({
      date,
      views: stats.views,
      earnings: Number(stats.earnings.toFixed(2)),
      likes: stats.likes,
      comments: stats.comments
    })).reverse(); // Most recent first

    // Calculate performance metrics
    const totalViews = metrics._sum.views || 0;
    const totalLikes = metrics._sum.likes || 0;
    const totalComments = metrics._sum.comments || 0;
    const totalEarnings = metrics._sum.earnings || 0;
    const totalPosts = metrics._count.id || 0;

    // Average engagement rate calculation
    const averageEngagement = totalViews > 0 
      ? Number((((totalLikes + totalComments) / totalViews) * 100).toFixed(2))
      : 0;

    // Trend calculations
    const currentViews = totalViews;
    const previousViews = prevMetrics._sum.views || 0;
    const viewsTrend = previousViews > 0 
      ? Number((((currentViews - previousViews) / previousViews) * 100).toFixed(1))
      : currentViews > 0 ? 100 : 0;

    const currentEarnings = totalEarnings;
    const previousEarnings = prevMetrics._sum.earnings || 0;
    const earningsTrend = previousEarnings > 0
      ? Number((((currentEarnings - previousEarnings) / previousEarnings) * 100).toFixed(1))
      : currentEarnings > 0 ? 100 : 0;

    // Enhanced platform breakdown with performance metrics
    const enhancedPlatforms = platforms.map(platform => ({
      ...platform,
      averageViewsPerPost: platform.posts > 0 ? Math.round(platform.views / platform.posts) : 0,
      averageEarningsPerPost: platform.posts > 0 ? Number((platform.earnings / platform.posts).toFixed(2)) : 0,
      engagementRate: platform.views > 0 
        ? Number((((platform.likes + platform.comments) / platform.views) * 100).toFixed(2))
        : 0
    }));

    // Performance insights
    const insights = {
      bestPerformingPlatform: enhancedPlatforms.length > 0 ? enhancedPlatforms[0].platform : null,
      averagePostsPerDay: totalPosts > 0 ? Number((totalPosts / days).toFixed(1)) : 0,
      topEngagementPost: topPerformingContent.length > 0 
        ? topPerformingContent.reduce((prev, current) => 
            prev.engagement > current.engagement ? prev : current
          )
        : null,
      totalReach: totalViews, // This could be enhanced with actual reach data
      conversionRate: totalViews > 0 ? Number(((totalEarnings / totalViews) * 1000).toFixed(2)) : 0 // Earnings per 1000 views
    };

    const responseData = {
      totalViews,
      totalLikes,
      totalComments,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalPosts,
      averageEngagement,
      topPerformingContent,
      platformBreakdown: enhancedPlatforms,
      dailyStats,
      trends: {
        views: viewsTrend,
        earnings: earningsTrend,
        engagement: 0 // Could be calculated with historical data
      },
      insights,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataPoints: analytics.length,
        hasPartialData: errors.length > 0
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('CREATOR_ANALYTICS_API_ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch analytics data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}