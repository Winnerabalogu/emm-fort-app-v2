// app/api/creator/earnings/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfWeek, eachDayOfInterval, format, startOfMonth, endOfDay } from 'date-fns';

// Types to match your component expectations
interface TransactionFilter {
  userId: string;
  createdAt: { gte: Date };
  type?: string;
  status?: string | { in: string[] };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7days';
    const filterType = searchParams.get('filterType') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isCreator: true, 
        username: true,
        withdrawalDetails: true 
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    const now = new Date();
    let startDate: Date;
    
    // Calculate date range based on timeRange parameter
    switch (timeRange) {
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      case '365days':
        startDate = subDays(now, 365);
        break;
      default: // 7days
        startDate = subDays(now, 7);
    }

    // Build transaction filter based on filterType
    const transactionFilter: TransactionFilter = {
      userId: userId,
      createdAt: { gte: startDate }
    };

    if (filterType === 'commission') {
      transactionFilter.type = 'COMMISSION';
    } else if (filterType === 'withdrawal') {
      transactionFilter.type = 'WITHDRAWAL';
    }

    // Parallel queries for earnings data
    const [
      // Summary statistics
      totalEarningsData,
      thisMonthEarningsData,
      thisWeekEarningsData,
      pendingEarningsData,
      totalWithdrawalsData,
      
      // Chart data - daily earnings for the selected period
      dailyEarningsData,
      
      // Paginated transactions
      transactions,
      transactionCount,
      
      // Additional metrics
      totalOrdersData,
      averageOrderValue,
      totalCustomersData
    ] = await Promise.all([
      // Total earnings (all time)
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        _count: true
      }),

      // This month earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth(now) }
        },
        _sum: { amount: true }
      }),

      // This week earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: startOfWeek(now, { weekStartsOn: 1 }) }
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

      // Total withdrawals
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'WITHDRAWAL',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // Daily earnings data for chart
      prisma.transaction.findMany({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        select: {
          amount: true,
          createdAt: true,
          sourceUserId: true
        },
        orderBy: { createdAt: 'asc' }
      }),

      // Paginated transactions
      prisma.transaction.findMany({
        where: transactionFilter,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true,
          sourceUser: {
            select: {
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),

      // Transaction count for pagination
      prisma.transaction.count({
        where: transactionFilter
      }),

      // Total orders from referrals
      prisma.transaction.count({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        }
      }),

      // Average order value (commission * 20 since 5% commission)
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        },
        _avg: { amount: true }
      }),

      // Total unique customers (users referred by this creator)
      prisma.user.count({
        where: {
          uplinerId: userId,
          emailVerified: { not: null }
        }
      })
    ]);

    // Process daily earnings data for chart (matching your component format)
    const earningsMap = new Map<string, { earnings: number; orders: number; referrals: Set<string> }>();
    
    // Initialize all days in range
    eachDayOfInterval({ start: startDate, end: endOfDay(now) }).forEach(date => {
      const dayKey = format(date, 'EEE'); // Mon, Tue, Wed format
      if (!earningsMap.has(dayKey)) {
        earningsMap.set(dayKey, { earnings: 0, orders: 0, referrals: new Set() });
      }
    });

    // Populate with actual data
    dailyEarningsData.forEach(transaction => {
      const dayKey = format(transaction.createdAt, 'EEE');
      const dayData = earningsMap.get(dayKey);
      if (dayData) {
        dayData.earnings += Number(transaction.amount);
        dayData.orders += 1;
        if (transaction.sourceUserId) {
          dayData.referrals.add(transaction.sourceUserId);
        }
      }
    });

    // Convert to array for chart (matching your DailyEarningsData type)
    const chartData = Array.from(earningsMap.entries()).map(([date, data]) => ({
      date,
      earnings: Number(data.earnings.toFixed(2)),
      orders: data.orders,
      referrals: data.referrals.size
    }));

    // Calculate metrics
    const totalEarnings = totalEarningsData._sum.amount || 0;
    const thisMonthEarnings = thisMonthEarningsData._sum.amount || 0;
    const thisWeekEarnings = thisWeekEarningsData._sum.amount || 0;
    const pendingEarnings = pendingEarningsData._sum.amount || 0;
    const totalWithdrawals = totalWithdrawalsData._sum.amount || 0;
    const availableBalance = totalEarnings - totalWithdrawals;
    const averageCommission = averageOrderValue._avg.amount || 0;
    const estimatedAverageOrderValue = averageCommission * 20; // Reverse calculate from 5% commission

    // Calculate growth percentage (month over month)
    const lastMonthStart = startOfMonth(subDays(startOfMonth(now), 1));
    const lastMonthEnd = subDays(startOfMonth(now), 1);
    const lastMonthEarningsData = await prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: 'COMMISSION',
        status: 'COMPLETED',
        createdAt: { 
          gte: lastMonthStart, 
          lte: lastMonthEnd 
        }
      },
      _sum: { amount: true }
    });

    const lastMonthEarnings = lastMonthEarningsData._sum.amount || 0;
    const earningsGrowth = lastMonthEarnings > 0 ? 
      Number((((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)) : 
      thisMonthEarnings > 0 ? 100 : 0;

    // Format transactions to match your component interface
    const formattedTransactions = transactions.map((tx, index) => ({
      id: index + 1, // Your component expects number IDs
      type: tx.type.toLowerCase() as 'commission' | 'withdrawal',
      amount: Number(tx.amount.toFixed(2)),
      customer: tx.sourceUser?.fullName || 'System',
      orderValue: tx.type === 'COMMISSION' ? Number((tx.amount * 20).toFixed(2)) : 0,
      date: tx.createdAt.toISOString(),
      status: tx.status.toLowerCase() as 'completed' | 'pending' | 'processing',
      referralCode: user.username?.toUpperCase() + new Date().getFullYear()
    }));

    // Structure response to match your component expectations
    const responseData = {
      success: true,
      data: {
        // Earnings summary matching EarningsSummary interface
        summary: {
          totalEarnings: Number(totalEarnings.toFixed(2)),
          thisWeekEarnings: Number(thisWeekEarnings.toFixed(2)),
          pendingEarnings: Number(pendingEarnings.toFixed(2)),
          averageOrderValue: Number(estimatedAverageOrderValue.toFixed(2)),
          totalOrders: totalOrdersData,
          totalCustomers: totalCustomersData,
          monthlyGrowth: earningsGrowth
        },

        // Chart data matching DailyEarningsData[]
        chartData: {
          timeRange,
          data: chartData
        },

        // Transactions matching Transaction interface
        transactions: {
          data: formattedTransactions,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(transactionCount / limit),
            totalCount: transactionCount,
            hasNext: page < Math.ceil(transactionCount / limit),
            hasPrev: page > 1
          }
        },

        // Payout info matching PayoutInfo interface
        payoutInfo: {
          nextPayoutAmount: Number(pendingEarnings.toFixed(2)),
          nextPayoutDate: getNextPayoutDate(),
          payoutFrequency: 'bi-weekly' as const,
          processingDays: '2-3 business days'
        },

        // Additional context
        userInfo: {
          referralCode: user.username?.toUpperCase() + new Date().getFullYear(),
          hasWithdrawalDetails: !!user.withdrawalDetails,
          canRequestPayout: availableBalance >= 100.00,
          availableBalance: Number(availableBalance.toFixed(2))
        }
      }
    };

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error("CREATOR_EARNINGS_API_ERROR:", error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch earnings data',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// POST endpoint for requesting withdrawals
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { amount, note } = await request.json();

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isCreator: true,
        withdrawalDetails: true
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    if (!user.withdrawalDetails) {
      return NextResponse.json({ 
        success: false,
        error: 'Please add withdrawal details first' 
      }, { status: 400 });
    }

    // Validate amount
    if (!amount || amount < 100) {
      return NextResponse.json({ 
        success: false,
        error: 'Minimum withdrawal amount is ₦100' 
      }, { status: 400 });
    }

    // Check available balance
    const [totalEarnings, totalWithdrawals] = await Promise.all([
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
          type: 'WITHDRAWAL',
          status: { in: ['COMPLETED', 'PENDING'] }
        },
        _sum: { amount: true }
      })
    ]);

    const availableBalance = (totalEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

    if (amount > availableBalance) {
      return NextResponse.json({ 
        success: false,
        error: `Insufficient balance. Available: ₦${availableBalance.toFixed(2)}` 
      }, { status: 400 });
    }

    // Create withdrawal request
    const withdrawal = await prisma.transaction.create({
      data: {
        userId: userId,
        type: 'WITHDRAWAL',
        amount: amount,
        status: 'PENDING',
        description: note || 'Creator withdrawal request'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Withdrawal request submitted successfully',
        withdrawalId: withdrawal.id,
        amount: Number(amount.toFixed(2)),
        status: 'PENDING',
        estimatedProcessing: '2-3 business days'
      }
    });

  } catch (error: unknown) {
    console.error("CREATOR_WITHDRAWAL_API_ERROR:", error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process withdrawal request',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// Helper function to calculate next payout date (bi-weekly on Fridays)
function getNextPayoutDate(): string {
  const now = new Date();
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7; // Next Friday
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  
  // If today is Friday, check if it's after business hours (5 PM)
  if (now.getDay() === 5 && now.getHours() >= 17) {
    nextFriday.setDate(nextFriday.getDate() + 7); // Next Friday
  }
  
  return format(nextFriday, 'EEEE, MMMM do');
}