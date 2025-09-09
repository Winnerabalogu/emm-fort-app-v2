// app/api/creator/analytics/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session?.user?.isCreator) {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days));

    // Get content metrics
    const [
      contentPosts,
      totalMetrics,
      platformBreakdown,
      dailyAnalytics
    ] = await Promise.all([
      // Get all content posts in period
      prisma.contentPost.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
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
        orderBy: { views: 'desc' },
        take: 10
      }),

      // Get total metrics
      prisma.contentPost.aggregate({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _sum: {
          views: true,
          likes: true,
          comments: true,
          shares: true,
          earnings: true
        },
        _avg: {
          views: true,
          likes: true
        }
      }),

      // Platform breakdown
      prisma.$queryRaw`
        SELECT 
          platform,
          COUNT(*)::int as posts,
          SUM(views)::int as views,
          SUM(earnings)::float as earnings
        FROM "ContentPost"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${startDate}
        GROUP BY platform
        ORDER BY earnings DESC
      ` as Promise<Array<{
        platform: string;
        posts: number;
        views: number;
        earnings: number;
      }>>,

      // Daily analytics
      prisma.contentAnalytics.findMany({
        where: {
          contentPost: {
            userId
          },
          date: { gte: startDate }
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
      })
    ]);

    // Calculate engagement rates
    const topPerformingContent = contentPosts.map(post => {
      const totalInteractions = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
      const engagement = post.views > 0 ? (totalInteractions / post.views) * 100 : 0;
      
      return {
        id: post.id,
        title: post.title,
        platform: post.platform,
        type: post.type,
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        earnings: post.earnings || 0,
        publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        engagement: Number(engagement.toFixed(2))
      };
    });

    // Aggregate daily stats
    const dailyStatsMap = new Map<string, { views: number; earnings: number }>();
    
    // Initialize map with zeros for all days
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      dailyStatsMap.set(date, { views: 0, earnings: 0 });
    }

    // Fill in actual data
    dailyAnalytics.forEach(stat => {
      const dateKey = format(stat.date, 'MMM dd');
      const existing = dailyStatsMap.get(dateKey) || { views: 0, earnings: 0 };
      dailyStatsMap.set(dateKey, {
        views: existing.views + (stat.views || 0),
        earnings: existing.earnings + (stat.earnings || 0)
      });
    });

    const dailyStats = Array.from(dailyStatsMap, ([date, stats]) => ({
      date,
      views: stats.views,
      earnings: Number(stats.earnings.toFixed(2))
    })).reverse();

    // Calculate average engagement
    const totalViews = totalMetrics._sum.views || 0;
    const totalLikes = totalMetrics._sum.likes || 0;
    const totalComments = totalMetrics._sum.comments || 0;
    const averageEngagement = totalViews > 0 
      ? ((totalLikes + totalComments) / totalViews) * 100 
      : 0;

    // Calculate trend (compare last half of period to first half)
    const midPoint = Math.floor(dailyStats.length / 2);
    const firstHalfViews = dailyStats.slice(0, midPoint).reduce((sum, d) => sum + d.views, 0);
    const secondHalfViews = dailyStats.slice(midPoint).reduce((sum, d) => sum + d.views, 0);
    const engagementTrend = firstHalfViews > 0 
      ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100
      : 0;

    return NextResponse.json({
      totalViews: totalMetrics._sum.views || 0,
      totalLikes: totalMetrics._sum.likes || 0,
      totalComments: totalMetrics._sum.comments || 0,
      totalEarnings: Number((totalMetrics._sum.earnings || 0).toFixed(2)),
      averageEngagement: Number(averageEngagement.toFixed(2)),
      topPerformingContent,
      platformBreakdown: platformBreakdown || [],
      dailyStats,
      engagementTrend: Number(engagementTrend.toFixed(1)),
      period
    });

  } catch (error) {
    console.error("CREATOR_ANALYTICS_API_ERROR:", error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}