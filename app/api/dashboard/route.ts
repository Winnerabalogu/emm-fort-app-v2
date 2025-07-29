// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { tierQuarterlyTargets } from '@/lib/tierData';
import { UserProfile, TransactionType, TransactionStatus } from '@/lib/types'; 
import { startOfWeek } from 'date-fns/startOfWeek';
import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { subMonths } from 'date-fns/subMonths';
import { eachMonthOfInterval } from 'date-fns/eachMonthOfInterval';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use findUnique instead of findUniqueOrThrow for better error handling
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        withdrawalDetails: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        referredUsers: {
          select: { id: true, fullName: true, tier: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // --- Core Business Logic Calculations ---
    const now = new Date();
    
    let totalEarned = 0;
    let totalWithdrawn = 0;
    
    // Filter for completed transactions for accurate financial calculations
    const completedTransactions = user.transactions.filter(tx => tx.status === 'COMPLETED');

    for (const tx of completedTransactions) {
      if (tx.type === 'COMMISSION' || tx.type === 'BONUS') {
        totalEarned += tx.amount;
      } else if (tx.type === 'WITHDRAWAL') {
        totalWithdrawn += tx.amount;
      }
    }
    const balance = totalEarned - totalWithdrawn;
    
    // Use only completed earning transactions for charts
    const earningTransactions = completedTransactions.filter(tx => 
      tx.type === 'COMMISSION' || tx.type === 'BONUS'
    );

    // 1. Monthly View: Last 30 days
    const monthlyInterval = { start: subDays(now, 29), end: now };
    const monthlyDataMap = new Map<string, number>();
    
    // Initialize all days with 0
    const monthlyDays = eachDayOfInterval(monthlyInterval);
    monthlyDays.forEach(day => {
      monthlyDataMap.set(format(day, 'MMM d'), 0);
    });

    // Add transaction amounts to respective days
    earningTransactions
      .filter(t => t.createdAt >= monthlyInterval.start)
      .forEach(tx => {
        const dayKey = format(tx.createdAt, 'MMM d');
        if (monthlyDataMap.has(dayKey)) {
          monthlyDataMap.set(dayKey, (monthlyDataMap.get(dayKey) || 0) + tx.amount);
        }
      });

    const monthlyChartData = Array.from(monthlyDataMap, ([name, value]) => ({ name, value }));
    
    // 2. Quarterly View: Last 13 weeks
    const quarterlyInterval = { start: subDays(now, 90), end: now };
    const quarterlyDataMap = new Map<string, number>();
    
    // Initialize weeks
    for (let i = 12; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(now, i * 7));
      quarterlyDataMap.set(`W${format(weekStart, 'w')}`, 0);
    }

    // Add transaction amounts to respective weeks
    earningTransactions
      .filter(t => t.createdAt >= quarterlyInterval.start)
      .forEach(tx => {
        const weekStart = startOfWeek(tx.createdAt);
        const weekKey = `W${format(weekStart, 'w')}`;
        if (quarterlyDataMap.has(weekKey)) {
          quarterlyDataMap.set(weekKey, (quarterlyDataMap.get(weekKey) || 0) + tx.amount);
        }
      });

    const quarterlyChartData = Array.from(quarterlyDataMap, ([name, value]) => ({ name, value }));

    // 3. Yearly View: Last 12 months
    const yearlyInterval = { start: subMonths(now, 11), end: now };
    const yearlyDataMap = new Map<string, number>();
    
    // Initialize months
    const yearlyMonths = eachMonthOfInterval(yearlyInterval);
    yearlyMonths.forEach(month => {
      yearlyDataMap.set(format(month, 'MMM'), 0);
    });

    // Add transaction amounts to respective months
    earningTransactions
      .filter(t => t.createdAt >= yearlyInterval.start)
      .forEach(tx => {
        const monthKey = format(tx.createdAt, 'MMM');
        if (yearlyDataMap.has(monthKey)) {
          yearlyDataMap.set(monthKey, (yearlyDataMap.get(monthKey) || 0) + tx.amount);
        }
      });

    const yearlyChartData = Array.from(yearlyDataMap, ([name, value]) => ({ name, value }));
    
    const chartDataObject = {
      monthly: monthlyChartData,
      quarterly: quarterlyChartData,
      yearly: yearlyChartData,
    };

    // Calculate earnings from each downline (for the sidebar)
    const downlinesWithEarnings = await Promise.all(
      user.referredUsers.map(async (downline) => {
        try {
          const commissions = await prisma.transaction.findMany({
            where: { 
              userId: user.id, 
              type: 'COMMISSION', 
              sourceUserId: downline.id, 
              status: 'COMPLETED' 
            },
            select: { amount: true },
          });
          const earnings = commissions.reduce((sum, t) => sum + t.amount, 0);
          return { 
            id: downline.id, 
            name: downline.fullName, 
            tier: downline.tier, 
            benefit: earnings 
          };
        } catch (error) {
          console.error(`Error calculating earnings for downline ${downline.id}:`, error);
          return { 
            id: downline.id, 
            name: downline.fullName, 
            tier: downline.tier, 
            benefit: 0 
          };
        }
      })
    );
    
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
      transactions: user.transactions.slice(0, 5).map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        amount: tx.amount,
        date: tx.createdAt.toISOString(),
        status: tx.status as TransactionStatus,
      })),
      downlines: downlinesWithEarnings,
      withdrawalDetails: user.withdrawalDetails || null,
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error("API_DASHBOARD_ERROR: ", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('P2025')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.message.includes('auth')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: 'An internal error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}