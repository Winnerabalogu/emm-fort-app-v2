/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/dashboard/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { tierQuarterlyTargets } from '@/lib/tierData';
import { UserProfile, TransactionType, TransactionStatus } from '@/lib/types'; 
import { startOfWeek, format, subDays, eachDayOfInterval, subMonths, eachMonthOfInterval } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const yearlyStart = subMonths(now, 11);

    // OPTIMIZATION 1: Parallel queries for maximum performance
    const [
      user,
      earningsData,
      withdrawalsData,
      chartTransactions,
      downlineCommissions,
      recentTransactions
    ] = await Promise.all([
      // Basic user info with referrals
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          phone: true,
          tier: true,
          subscriptionStartDate: true,
          subscriptionExpiryDate: true,
          referredUsers: {
            select: { 
              id: true, 
              fullName: true, 
              tier: true 
            }
          },
          withdrawalDetails: true
        }
      }),

      // OPTIMIZATION 2: Aggregate earnings (COMMISSION + BONUS)
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          status: 'COMPLETED',
          type: { in: ['COMMISSION', 'BONUS'] }
        },
        _sum: { amount: true }
      }),

      // OPTIMIZATION 3: Aggregate withdrawals separately
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          status: 'COMPLETED',
          type: 'WITHDRAWAL'
        },
        _sum: { amount: true }
      }),

      // OPTIMIZATION 4: Chart data with date filtering at DB level
      prisma.transaction.findMany({
        where: {
          userId: userId,
          status: 'COMPLETED',
          type: { in: ['COMMISSION', 'BONUS'] },
          createdAt: { gte: yearlyStart }
        },
        select: {
          amount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      }),

      // OPTIMIZATION 5: Single query for all downline commissions
      prisma.transaction.groupBy({
        by: ['sourceUserId'],
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          sourceUserId: { not: null }
        },
        _sum: { amount: true }
      }),

      // OPTIMIZATION 6: Recent transactions for UI (limited)
      prisma.transaction.findMany({
        where: { userId: userId },
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate financial summary
    const totalEarned = earningsData._sum.amount || 0;
    const totalWithdrawn = withdrawalsData._sum.amount || 0;
    const balance = totalEarned - totalWithdrawn;

    // OPTIMIZATION 7: Efficient chart data generation
    const chartDataObject = generateOptimizedChartData(chartTransactions, now);

    // OPTIMIZATION 8: Map downline commissions efficiently
    const commissionMap = new Map(
      downlineCommissions.map(item => [
        item.sourceUserId!, 
        item._sum.amount || 0
      ])
    );

    const downlinesWithEarnings = user.referredUsers.map(downline => ({
      id: downline.id,
      name: downline.fullName,
      tier: downline.tier,
      benefit: commissionMap.get(downline.id) || 0
    }));

    // Construct response
    const userProfile: UserProfile = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      tier: user.tier,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionExpiryDate: user.subscriptionExpiryDate,
      balance: balance,
      totalEarned: totalEarned,
      monthlyTarget: {
        target: tierQuarterlyTargets[user.tier] || 0,
        history: chartDataObject,
      },
      transactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        amount: tx.amount,
        date: tx.createdAt.toISOString(),
        status: tx.status as TransactionStatus,
      })),
      downlines: downlinesWithEarnings,
      withdrawalDetails: user.withdrawalDetails || null,
    };

    // OPTIMIZATION 9: Cache response
    const response = NextResponse.json(userProfile);
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    
    return response;

  }catch (error: unknown) {
  console.error("API_DASHBOARD_ERROR: ", error);

  if (error instanceof Error) {
    // Prisma-specific error handling
    if (error.message.includes('P2025')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

// OPTIMIZATION 10: Streamlined chart data generation
function generateOptimizedChartData(transactions: any[], now: Date) {
  const monthlyStart = subDays(now, 29);
  const quarterlyStart = subDays(now, 90);
  const yearlyStart = subMonths(now, 11);

  // Create efficient data structures
  const monthlyMap = new Map<string, number>();
  const quarterlyMap = new Map<string, number>();
  const yearlyMap = new Map<string, number>();

  // Initialize time periods
  eachDayOfInterval({ start: monthlyStart, end: now })
    .forEach(day => monthlyMap.set(format(day, 'MMM d'), 0));
  
  for (let i = 12; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(now, i * 7));
    quarterlyMap.set(`W${format(weekStart, 'w')}`, 0);
  }
  
  eachMonthOfInterval({ start: yearlyStart, end: now })
    .forEach(month => yearlyMap.set(format(month, 'MMM'), 0));

  // Single pass through transactions to populate all charts
  transactions.forEach(tx => {
    const txDate = new Date(tx.createdAt);
    const amount = tx.amount;

    // Monthly data
    if (txDate >= monthlyStart) {
      const dayKey = format(txDate, 'MMM d');
      if (monthlyMap.has(dayKey)) {
        monthlyMap.set(dayKey, monthlyMap.get(dayKey)! + amount);
      }
    }

    // Quarterly data
    if (txDate >= quarterlyStart) {
      const weekKey = `W${format(startOfWeek(txDate), 'w')}`;
      if (quarterlyMap.has(weekKey)) {
        quarterlyMap.set(weekKey, quarterlyMap.get(weekKey)! + amount);
      }
    }

    // Yearly data
    if (txDate >= yearlyStart) {
      const monthKey = format(txDate, 'MMM');
      if (yearlyMap.has(monthKey)) {
        yearlyMap.set(monthKey, yearlyMap.get(monthKey)! + amount);
      }
    }
  });

  return {
    monthly: Array.from(monthlyMap, ([name, value]) => ({ name, value })),
    quarterly: Array.from(quarterlyMap, ([name, value]) => ({ name, value })),
    yearly: Array.from(yearlyMap, ([name, value]) => ({ name, value }))
  };
}