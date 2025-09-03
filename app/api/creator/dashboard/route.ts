// app/api/creator/dashboard/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, subDays, eachDayOfInterval, format } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = subDays(now, 30);

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

    // Calculate growth percentages (mock calculation for demo)
    const earningsGrowth = thisMonthEarnings > 0 ? 
      ((thisWeekEarnings * 4 - thisMonthEarnings) / thisMonthEarnings * 100) : 0;

    // Generate referral code (using username with current year)
    const referralCode = `${user.username?.toUpperCase()}${new Date().getFullYear()}`;

    // Create dashboard response
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
        memberSince: user.createdAt
      },
      stats: {
        totalEarnings: Number(totalEarnings.toFixed(2)),
        thisWeekEarnings: Number(thisWeekEarnings.toFixed(2)),
        thisMonthEarnings: Number(thisMonthEarnings.toFixed(2)),
        pendingEarnings: Number(pendingEarnings.toFixed(2)),
        earningsGrowth: Number(earningsGrowth.toFixed(1)),
        totalReferrals: totalReferralsCount,
        thisWeekReferrals: thisWeekReferralsCount,
        totalContentPosts: contentPostsCount,
        thisWeekContentPosts: thisWeekContentCount
      },
       dailyEarnings,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount.toFixed(2)),
        status: tx.status,
        description: tx.description,
        createdAt: tx.createdAt.toISOString()
      })),
      recentActivity: [
        // Add recent transactions as activity
        ...recentTransactions.slice(0, 2).map(tx => ({
          type: tx.type === 'COMMISSION' ? 'earning' : 'withdrawal',
          message: tx.type === 'COMMISSION' ? 'Commission earned from grocery order' : 'Withdrawal processed',
          amount: tx.type === 'COMMISSION' ? `₦${tx.amount.toFixed(2)}` : `₦${tx.amount.toFixed(2)}`,
          time: getRelativeTime(tx.createdAt),
          createdAt: tx.createdAt.toISOString()
        })),
        // Add recent content as activity
        ...recentActivity.map(content => ({
          type: 'content',
          referralField: 'referrerId',
          message: `Posted ${content.type} on ${content.platform}`,
          amount: `${content.likes} likes`,
          time: getRelativeTime(content.createdAt),
          createdAt: content.createdAt.toISOString()
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)
    };

    const response = NextResponse.json(dashboardData);
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    
    return response;

  } catch (error: unknown) {
    console.error("CREATOR_DASHBOARD_API_ERROR: ", error);

    if (error instanceof Error) {
      if (error.message.includes('P2025')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}