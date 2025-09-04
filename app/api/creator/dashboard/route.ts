// app/api/creator/dashboard/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { format, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session?.user?.isCreator) {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    const userId = session.user.id;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Check if user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        isCreator: true,
        instagramHandle: true,
        tiktokHandle: true,
        whatsappNumber: true,
        contentStyle: true,
        followersCount: true,
        createdAt: true
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ error: 'Access denied. Creator account required.' }, { status: 403 });
    }

    // Parallel queries for performance
    const [
      totalEarningsData,
      thisWeekEarningsData,
      thisMonthEarningsData,
      pendingEarningsData,
      totalReferralsCount,
      thisWeekReferralsCount,
      contentPostsCount,
      thisWeekContentCount,
      recentTransactions,
      recentActivity
    ] = await Promise.all([
      // Total earnings from commissions
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // This week earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),

      // This month earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),

      // Pending earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // Total referrals count
      prisma.user.count({
        where: { 
          uplinerId: userId,
          emailVerified: { not: null }
        }
      }),

      // This week referrals
      prisma.user.count({
        where: { 
          uplinerId: userId,
          emailVerified: { not: null },
          createdAt: { gte: weekStart }
        }
      }),

      // Total content posts
      prisma.contentPost.count({
        where: { userId: userId }
      }),

      // This week content posts
      prisma.contentPost.count({
        where: { 
          userId: userId,
          createdAt: { gte: weekStart }
        }
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: { userId: userId },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent activity (mix of content posts and transactions)
      prisma.contentPost.findMany({
        where: { userId: userId },
        select: {
          id: true,
          title: true,
          platform: true,
          type: true,
          views: true,
          likes: true,
          earnings: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      })
    ]);

    // Calculate summary data
    const totalEarnings = totalEarningsData._sum.amount || 0;
    const thisWeekEarnings = thisWeekEarningsData._sum.amount || 0;
    const thisMonthEarnings = thisMonthEarningsData._sum.amount || 0;
    const pendingEarnings = pendingEarningsData._sum.amount || 0;

    // Generate last 30 days earnings trend
    const dailyEarningsMap = new Map<string, number>();

    eachDayOfInterval({ start: monthStart, end: now }).forEach(date => {
      const dayKey = format(date, 'MMM d'); // e.g. "Aug 25"
      dailyEarningsMap.set(dayKey, 0);
    });

    const transactionsLast30Days = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'COMMISSION',
        status: 'COMPLETED',
        createdAt: { gte: monthStart }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    transactionsLast30Days.forEach(tx => {
      const dayKey = format(tx.createdAt, 'MMM d');
      dailyEarningsMap.set(dayKey, (dailyEarningsMap.get(dayKey) || 0) + Number(tx.amount));
    });

    // Convert to array for charting
    const dailyEarnings = Array.from(dailyEarningsMap, ([date, earnings]) => ({
      date,
      earnings: Number(earnings.toFixed(2))
    }));

    // Calculate growth percentages
    const earningsGrowth = thisMonthEarnings > 0 ? 
      ((thisWeekEarnings * 4 - thisMonthEarnings) / thisMonthEarnings * 100) : 0;

    // Generate referral code (using username with current year)
    const referralCode = `${user.username?.toUpperCase()}${new Date().getFullYear()}`;

    // Transform content posts to activity format
    const contentActivities = recentActivity.map(content => ({
      id: content.id,
      type: 'content' as const,
      description: `Posted "${content.title}" on ${content.platform}`,
      timestamp: content.createdAt.toISOString(),
      amount: content.earnings || null,
      metadata: {
        platform: content.platform,
        views: content.views,
        likes: content.likes
      }
    }));

    // Transform transactions to activity format
    const transactionActivities = recentTransactions
      .filter(tx => tx.amount > 50) // Only show significant transactions
      .slice(0, 3)
      .map(tx => ({
        id: tx.id,
        type: 'earning' as const,
        description: tx.description || `${tx.type.toLowerCase()} received`,
        timestamp: tx.createdAt.toISOString(),
        amount: tx.amount
      }));

    // Combine and sort activities
    const allActivities = [...contentActivities, ...transactionActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Construct response
    const dashboardData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        instagramHandle: user.instagramHandle,
        tiktokHandle: user.tiktokHandle,
        whatsappNumber: user.whatsappNumber,
        contentStyle: user.contentStyle,
        followersCount: user.followersCount,
        referralCode: referralCode,
        isCreator: user.isCreator,
        joinDate: user.createdAt.toISOString()
      },
      stats: {
        totalEarnings: Number(totalEarnings),
        thisWeekEarnings: Number(thisWeekEarnings),
        thisMonthEarnings: Number(thisMonthEarnings),
        pendingEarnings: Number(pendingEarnings),
        totalReferrals: totalReferralsCount,
        thisWeekReferrals: thisWeekReferralsCount,
        totalContentPosts: contentPostsCount,
        thisWeekContentPosts: thisWeekContentCount,
        earningsGrowth: Number(earningsGrowth.toFixed(1)),
        conversionRate: totalReferralsCount > 0 ? 
          ((totalReferralsCount / (totalReferralsCount + 50)) * 100).toFixed(1) : '0.0' // Example calculation
      },
      dailyEarnings: dailyEarnings,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        date: tx.createdAt.toISOString(),
        status: tx.status,
        description: tx.description
      })),
      recentActivity: allActivities,
      contentPerformance: recentActivity.map(content => ({
        id: content.id,
        title: content.title,
        platform: content.platform,
        type: content.type,
        views: content.views || 0,
        likes: content.likes || 0,
        earnings: Number(content.earnings || 0),
        createdAt: content.createdAt.toISOString()
      }))
    };

    // Cache response for 2 minutes
    const response = NextResponse.json(dashboardData);
    response.headers.set('Cache-Control', 'private, max-age=120, stale-while-revalidate=240');
    
    return response;

  } catch (error: unknown) {
    console.error("CREATOR_DASHBOARD_API_ERROR: ", error);

    if (error instanceof Error) {
      // Prisma-specific error handling
      if (error.message.includes('P2025')) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      if (error.message.includes('P2002')) {
        return NextResponse.json({ error: 'Database constraint error' }, { status: 400 });
      }
      if (error.message.includes('auth')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(error) : undefined,
      },
      { status: 500 }
    );
  }
}