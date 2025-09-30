// app/api/creator/content/analytics/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30d'; // 7d, 30d, 90d

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isCreator: true }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get analytics data
    const [
      totalStats,
      topPosts,
      platformBreakdown,
      dailyStats
    ] = await Promise.all([
      // Total statistics
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
        _count: true
      }),

      // Top performing posts
      prisma.contentPost.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
          status: 'published'
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
          createdAt: true
        },
        orderBy: [
          { views: 'desc' },
          { likes: 'desc' }
        ],
        take: 5
      }),

      // Platform breakdown
      prisma.contentPost.groupBy({
        by: ['platform'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _sum: {
          views: true,
          likes: true,
          earnings: true
        },
        _count: true
      }),

      // Daily stats for the past week
      prisma.contentAnalytics.findMany({
        where: {
          contentPost: {
            userId
          },
          date: { gte: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) }
        },
        select: {
          date: true,
          views: true,
          likes: true,
          comments: true,
          shares: true
        },
        orderBy: { date: 'asc' }
      })
    ]);

    // Calculate engagement rate
    const totalViews = totalStats._sum.views || 0;
    const totalEngagements = (totalStats._sum.likes || 0) + 
                            (totalStats._sum.comments || 0) + 
                            (totalStats._sum.shares || 0);
    const engagementRate = totalViews > 0 ? (totalEngagements / totalViews * 100) : 0;

    // Process platform breakdown
    const totalPlatformViews = platformBreakdown.reduce((sum, platform) => 
      sum + (platform._sum.views || 0), 0);

    const processedPlatformBreakdown = platformBreakdown.map(platform => ({
      platform: platform.platform,
      percentage: totalPlatformViews > 0 ? ((platform._sum.views || 0) / totalPlatformViews * 100) : 0,
      posts: platform._count,
      views: platform._sum.views || 0,
      earnings: platform._sum.earnings || 0,
      likes: platform._sum.likes || 0,
    }));

    return NextResponse.json({
      totalStats: {
        views: totalStats._sum.views || 0,
        likes: totalStats._sum.likes || 0,
        comments: totalStats._sum.comments || 0,
        shares: totalStats._sum.shares || 0,
        earnings: totalStats._sum.earnings || 0,
        posts: totalStats._count,
        engagementRate
      },
      topPosts,
      platformBreakdown: processedPlatformBreakdown,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}