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
        tier: true,
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

    // ====================================================================
    // ENHANCED: Parallel queries with BOTH commission types separated
    // ====================================================================
    const [
      // ===== AFFILIATE COMMISSIONS (from tier subscriptions) =====
      affiliateTotalEarnings,
      affiliateThisWeekEarnings,
      affiliateThisMonthEarnings,
      
      // ===== CREATOR COMMISSIONS (from grocery sales) =====
      creatorTotalEarnings,
      creatorThisWeekEarnings,
      creatorThisMonthEarnings,
      
      // ===== COMBINED DATA =====
      totalEarningsData,
      thisWeekEarningsData,
      thisMonthEarningsData,
      pendingEarningsData,
      
      // ===== REFERRALS & CONTENT =====
      totalReferralsCount,
      thisWeekReferralsCount,
      contentPostsCount,
      thisWeekContentCount,
      
      // ===== RECENT DATA =====
      recentTransactions,
      recentActivity,
      
      // ===== LAST 30 DAYS FOR CHART =====
      transactionsLast30Days
    ] = await Promise.all([
      // === AFFILIATE COMMISSIONS ===
      // Total affiliate earnings (tier subscriptions)
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: { not: null }, // Has sourceUserId = affiliate
          referralOrderId: null         // No orderId = affiliate
        },
        _sum: { amount: true },
        _count: true
      }),

      // This week affiliate earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: { not: null },
          referralOrderId: null,
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),

      // This month affiliate earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: { not: null },
          referralOrderId: null,
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),

      // === CREATOR COMMISSIONS ===
      // Total creator earnings (grocery sales)
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: null,               // No sourceUserId = creator
          referralOrderId: { not: null }    // Has orderId = creator
        },
        _sum: { amount: true },
        _count: true
      }),

      // This week creator earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: null,
          referralOrderId: { not: null },
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),

      // This month creator earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: null,
          referralOrderId: { not: null },
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),

      // === COMBINED TOTALS (preserve original behavior) ===
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),

      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),

      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // === REFERRALS & CONTENT (unchanged) ===
      prisma.user.count({
        where: { 
          uplinerId: userId,
          emailVerified: { not: null }
        }
      }),

      prisma.user.count({
        where: { 
          uplinerId: userId,
          emailVerified: { not: null },
          createdAt: { gte: weekStart }
        }
      }),

      prisma.contentPost.count({
        where: { userId: userId }
      }),

      prisma.contentPost.count({
        where: { 
          userId: userId,
          createdAt: { gte: weekStart }
        }
      }),

      // === RECENT TRANSACTIONS (enhanced with commission type) ===
      prisma.transaction.findMany({
        where: { userId: userId },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true,
          sourceUserId: true,      // NEW: to identify affiliate
          referralOrderId: true    // NEW: to identify creator
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Increased from 5 to show more
      }),

      // === RECENT ACTIVITY (unchanged) ===
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
      }),

      // === LAST 30 DAYS TRANSACTIONS ===
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: monthStart }
        },
        select: {
          amount: true,
          createdAt: true,
          sourceUserId: true,
          referralOrderId: true
        }
      })
    ]);

    // ====================================================================
    // CALCULATE SUMMARY DATA
    // ====================================================================
    
    // Affiliate earnings
    const affiliateTotal = affiliateTotalEarnings._sum.amount || 0;
    const affiliateWeek = affiliateThisWeekEarnings._sum.amount || 0;
    const affiliateMonth = affiliateThisMonthEarnings._sum.amount || 0;
    const affiliateCount = affiliateTotalEarnings._count;

    // Creator earnings
    const creatorTotal = creatorTotalEarnings._sum.amount || 0;
    const creatorWeek = creatorThisWeekEarnings._sum.amount || 0;
    const creatorMonth = creatorThisMonthEarnings._sum.amount || 0;
    const creatorCount = creatorTotalEarnings._count;

    // Combined (preserve original behavior)
    const totalEarnings = totalEarningsData._sum.amount || 0;
    const thisWeekEarnings = thisWeekEarningsData._sum.amount || 0;
    const thisMonthEarnings = thisMonthEarningsData._sum.amount || 0;
    const pendingEarnings = pendingEarningsData._sum.amount || 0;

    // ====================================================================
    // GENERATE DAILY EARNINGS CHART (last 30 days)
    // ====================================================================
    const dailyEarningsMap = new Map<string, { 
      total: number, 
      affiliate: number, 
      creator: number 
    }>();

    eachDayOfInterval({ start: monthStart, end: now }).forEach(date => {
      const dayKey = format(date, 'MMM d');
      dailyEarningsMap.set(dayKey, { total: 0, affiliate: 0, creator: 0 });
    });

    transactionsLast30Days.forEach(tx => {
      const dayKey = format(tx.createdAt, 'MMM d');
      const day = dailyEarningsMap.get(dayKey);
      if (day) {
        const amount = Number(tx.amount);
        day.total += amount;
        
        // Categorize by commission type
        if (tx.sourceUserId && !tx.referralOrderId) {
          day.affiliate += amount;
        } else if (!tx.sourceUserId && tx.referralOrderId) {
          day.creator += amount;
        }
      }
    });

    const dailyEarnings = Array.from(dailyEarningsMap, ([date, data]) => ({
      date,
      earnings: Number(data.total.toFixed(2)),
      affiliateEarnings: Number(data.affiliate.toFixed(2)),
      creatorEarnings: Number(data.creator.toFixed(2))
    }));

    // ====================================================================
    // CALCULATE GROWTH PERCENTAGES
    // ====================================================================
    const earningsGrowth = thisMonthEarnings > 0 ? 
      ((thisWeekEarnings * 4 - thisMonthEarnings) / thisMonthEarnings * 100) : 0;

    // ====================================================================
    // GENERATE REFERRAL CODE
    // ====================================================================
    const referralCode = `${user.username?.toUpperCase() || 'USER'}${new Date().getFullYear()}`;

    // ====================================================================
    // TRANSFORM ACTIVITIES WITH COMMISSION TYPE LABELS
    // ====================================================================
    
    // Content activities (unchanged)
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

    // Transaction activities with enhanced labels
    const transactionActivities = recentTransactions
      .filter(tx => tx.amount > 50)
      .slice(0, 5)
      .map(tx => {
        let commissionType = '';
        let description = tx.description || '';

        if (tx.type === 'COMMISSION') {
          if (tx.sourceUserId && !tx.referralOrderId) {
            commissionType = 'Affiliate';
            description = description || 'Commission from tier subscription referral';
          } else if (!tx.sourceUserId && tx.referralOrderId) {
            commissionType = 'Creator';
            description = description || 'Commission from grocery product sale';
          } else {
            commissionType = 'General';
          }
        }

        return {
          id: tx.id,
          type: 'earning' as const,
          description: commissionType ? `${commissionType} - ${description}` : description,
          timestamp: tx.createdAt.toISOString(),
          amount: tx.amount,
          commissionType: commissionType || null
        };
      });

    // Combine and sort
    const allActivities = [...contentActivities, ...transactionActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // ====================================================================
    // CONSTRUCT ENHANCED RESPONSE
    // ====================================================================
    const dashboardData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        tier: user.tier,
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
        // === COMBINED TOTALS (original behavior) ===
        totalEarnings: Number(totalEarnings),
        thisWeekEarnings: Number(thisWeekEarnings),
        thisMonthEarnings: Number(thisMonthEarnings),
        pendingEarnings: Number(pendingEarnings),
        
        // === NEW: AFFILIATE BREAKDOWN ===
        affiliateEarnings: Number(affiliateTotal),
        affiliateWeekEarnings: Number(affiliateWeek),
        affiliateMonthEarnings: Number(affiliateMonth),
        affiliateCommissionCount: affiliateCount,
        
        // === NEW: CREATOR BREAKDOWN ===
        creatorEarnings: Number(creatorTotal),
        creatorWeekEarnings: Number(creatorWeek),
        creatorMonthEarnings: Number(creatorMonth),
        creatorCommissionCount: creatorCount,
        
        // === EXISTING METRICS ===
        totalReferrals: totalReferralsCount,
        thisWeekReferrals: thisWeekReferralsCount,
        totalContentPosts: contentPostsCount,
        thisWeekContentPosts: thisWeekContentCount,
        earningsGrowth: Number(earningsGrowth.toFixed(1)),
        conversionRate: totalReferralsCount > 0 ? 
          ((totalReferralsCount / (totalReferralsCount + 50)) * 100).toFixed(1) : '0.0'
      },
      
      // Enhanced daily earnings with breakdown
      dailyEarnings: dailyEarnings,
      
      // Recent transactions with commission type
      recentTransactions: recentTransactions.map(tx => {
        let commissionType = null;
        if (tx.type === 'COMMISSION') {
          if (tx.sourceUserId && !tx.referralOrderId) {
            commissionType = 'affiliate';
          } else if (!tx.sourceUserId && tx.referralOrderId) {
            commissionType = 'creator';
          }
        }

        return {
          id: tx.id,
          type: tx.type,
          amount: Number(tx.amount),
          date: tx.createdAt.toISOString(),
          status: tx.status,
          description: tx.description,
          commissionType: commissionType
        };
      }),
      
      // Enhanced activity feed
      recentActivity: allActivities,
      
      // Content performance (unchanged)
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