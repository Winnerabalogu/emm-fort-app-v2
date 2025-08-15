// app/api/admin/reports/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
interface TopEarnerQueryResult {
  id: string;
  fullName: string | null;
  username: string;
  tier: string;
  total_earnings: string | number; 
}


// Input validation schema
const reportQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(['overview', 'users', 'financial', 'transactions']).default('overview')
});

// Rate limiting for expensive queries
const CACHE_TTL = 5 * 60 * 1000; 
const reportCache = new Map<string, { data: unknown; timestamp: number }>();


export const GET = withAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const queryParams = {
      from: url.searchParams.get('from'),
      to: url.searchParams.get('to'),
      type: url.searchParams.get('type') || 'overview'
    };

    // Validate input
    const validatedQuery = reportQuerySchema.parse(queryParams);

    // Check cache first
    const cacheKey = JSON.stringify(validatedQuery);
    const cached = reportCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    // Parse and validate date range
    const now = new Date();
    const fromDate = validatedQuery.from 
      ? new Date(validatedQuery.from) 
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = validatedQuery.to 
      ? new Date(validatedQuery.to) 
      : new Date();

    // Validate date range
    if (fromDate > toDate) {
      return NextResponse.json({
        success: false,
        error: 'From date cannot be later than to date'
      }, { status: 400 });
    }

    // Limit date range to prevent expensive queries
    const maxDaysRange = 365;
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDaysRange) {
      return NextResponse.json({
        success: false,
        error: `Date range cannot exceed ${maxDaysRange} days`
      }, { status: 400 });
    }

    toDate.setHours(23, 59, 59, 999);

    const dateRange = {
      gte: fromDate,
      lte: toDate
    };

    // Execute queries with timeout protection
    const queryTimeout = 30000; // 30 seconds
    const executeWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
        )
      ]);
    };

    const [
      totalUsers,
      newUsersInRange,
      activeUsers,
      usersByTier,
      revenueData,
      commissionData,
      transactionStats,
      withdrawalStats,
      topEarners
    ] = await executeWithTimeout(Promise.all([
      // Total users count
      prisma.user.count(),

      // New users in date range
      prisma.user.count({
        where: { 
          createdAt: dateRange,
          role: 'USER' // Exclude admins from user stats
        }
      }),

      // Active subscribers
      prisma.user.count({
        where: {
          role: 'USER',
          AND: [
            { subscriptionStartDate: { not: null } },
            { subscriptionExpiryDate: { gte: now } }
          ]
        }
      }),

      // Users by tier
      prisma.user.groupBy({
        by: ['tier'],
        where: { role: 'USER' },
        _count: { id: true }
      }),

      // Revenue data
      Promise.all([
        prisma.transaction.aggregate({
          where: {
            status: 'COMPLETED',
            type: { in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION'] }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            status: 'COMPLETED',
            type: { in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION'] },
            createdAt: dateRange
          },
          _sum: { amount: true }
        })
      ]),

      // Commission data
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: 'COMMISSION'
        },
        _sum: { amount: true }
      }),

      // Transaction statistics
      Promise.all([
        prisma.transaction.count(),
        prisma.transaction.count({ where: { createdAt: dateRange } }),
        prisma.transaction.groupBy({
          by: ['type'],
          where: { createdAt: dateRange },
          _count: { id: true },
          _sum: { amount: true }
        }),
        prisma.transaction.groupBy({
          by: ['status'],
          where: { createdAt: dateRange },
          _count: { id: true },
          _sum: { amount: true }
        })
      ]),

      // Withdrawal statistics
      Promise.all([
        prisma.withdrawalRequest.count(),
        prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
        prisma.withdrawalRequest.aggregate({
          where: { status: { in: ['APPROVED', 'COMPLETED'] } },
          _sum: { amount: true },
          _avg: { amount: true }
        })
      ]),

      // Top earners (limited to prevent data exposure)
      prisma.$queryRaw`
        SELECT 
          u.id,
          u."fullName",
          u.username,
          u.tier,
          COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type IN ('COMMISSION', 'BONUS') THEN t.amount ELSE 0 END), 0) as total_earnings
        FROM "User" u
        LEFT JOIN "Transaction" t ON u.id = t."userId"
        WHERE u.role = 'USER'
        GROUP BY u.id, u."fullName", u.username, u.tier
        HAVING SUM(CASE WHEN t.status = 'COMPLETED' AND t.type IN ('COMMISSION', 'BONUS') THEN t.amount ELSE 0 END) > 0
        ORDER BY total_earnings DESC
        LIMIT 10
      `
    ]));

    // Process user tier data
    const totalUserCount = totalUsers;
    const usersByTierWithPercentages = usersByTier.map(tier => ({
      tier: tier.tier,
      count: tier._count.id,
      percentage: totalUserCount > 0 ? Number(((tier._count.id / totalUserCount) * 100).toFixed(1)) : 0
    }));

    // Process top earners data with proper typing
  const processedTopEarners = (topEarners as TopEarnerQueryResult[]).map(earner => ({
  id: earner.id,
  fullName: earner.fullName,
  username: earner.username,
  tier: earner.tier,
  totalEarnings: Number(earner.total_earnings) || 0
}));
    // Calculate growth metrics safely
    const calculateGrowthMetrics = async () => {
      try {
        const lastPeriodStart = new Date(fromDate);
        lastPeriodStart.setMonth(lastPeriodStart.getMonth() - 1);
        const lastPeriodEnd = new Date(fromDate);
        lastPeriodEnd.setDate(0);
        lastPeriodEnd.setHours(23, 59, 59, 999);

        const [lastPeriodUsers, lastPeriodRevenue] = await Promise.all([
          prisma.user.count({
            where: {
              role: 'USER',
              createdAt: {
                gte: lastPeriodStart,
                lte: lastPeriodEnd
              }
            }
          }),
          prisma.transaction.aggregate({
            where: {
              status: 'COMPLETED',
              type: { in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION'] },
              createdAt: {
                gte: lastPeriodStart,
                lte: lastPeriodEnd
              }
            },
            _sum: { amount: true }
          })
        ]);

        const userGrowth = lastPeriodUsers > 0 
          ? Number((((newUsersInRange - lastPeriodUsers) / lastPeriodUsers) * 100).toFixed(1))
          : newUsersInRange > 0 ? 100 : 0;

        const currentRevenue = revenueData[1]._sum.amount || 0;
        const previousRevenue = lastPeriodRevenue._sum.amount || 0;
        const revenueGrowth = previousRevenue > 0 
          ? Number((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
          : currentRevenue > 0 ? 100 : 0;

        return { userGrowth, revenueGrowth };
      } catch (error) {
        console.error('Growth metrics calculation error:', error);
        return { userGrowth: 0, revenueGrowth: 0 };
      }
    };

    const growthMetrics = await calculateGrowthMetrics();

    // Calculate average commission per active user
    const activeCommissionUsers = await prisma.user.count({
      where: {
        role: 'USER',
        transactions: {
          some: {
            type: 'COMMISSION',
            status: 'COMPLETED'
          }
        }
      }
    });

    const averageCommissionPerUser = activeCommissionUsers > 0 
      ? Number(((commissionData._sum.amount || 0) / activeCommissionUsers).toFixed(2))
      : 0;

    // Build response data
    const reportData = {
      userStats: {
        totalUsers: totalUserCount,
        newUsersThisMonth: newUsersInRange,
        activeUsers,
        usersByTier: usersByTierWithPercentages
      },
      financialStats: {
        totalRevenue: Number((revenueData[0]._sum.amount || 0).toFixed(2)),
        monthlyRevenue: Number((revenueData[1]._sum.amount || 0).toFixed(2)),
        totalCommissions: Number((commissionData._sum.amount || 0).toFixed(2)),
        averageCommissionPerUser,
        topEarners: processedTopEarners
      },
      transactionStats: {
        totalTransactions: transactionStats[0],
        transactionsThisMonth: transactionStats[1],
        transactionsByType: transactionStats[2].map(t => ({
          type: t.type,
          count: t._count.id,
          amount: Number((t._sum.amount || 0).toFixed(2))
        })),
        transactionsByStatus: transactionStats[3].map(t => ({
          status: t.status,
          count: t._count.id,
          amount: Number((t._sum.amount || 0).toFixed(2))
        }))
      },
      withdrawalStats: {
        totalWithdrawals: withdrawalStats[0],
        pendingWithdrawals: withdrawalStats[1],
        totalWithdrawnAmount: Number((withdrawalStats[2]._sum.amount || 0).toFixed(2)),
        averageWithdrawalAmount: Number((withdrawalStats[2]._avg.amount || 0).toFixed(2))
      },
      growthMetrics: {
        userGrowthPercentage: growthMetrics.userGrowth,
        revenueGrowthPercentage: growthMetrics.revenueGrowth,
        monthlyGrowthData: [] // Can be populated separately if needed
      },
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      },
      generatedAt: new Date().toISOString()
    };

    // Cache the result
    reportCache.set(cacheKey, {
      data: reportData,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (reportCache.size > 100) {
      const oldestKey = Array.from(reportCache.keys())[0];
      reportCache.delete(oldestKey);
    }

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('ADMIN_REPORTS_ERROR:', error);
    
    // Return appropriate error response
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.flatten().fieldErrors
      }, { status: 400 });
    }

    if (error instanceof Error) {
      if (error.message === 'Query timeout') {
        return NextResponse.json({
          success: false,
          error: 'Query timeout - please try with a smaller date range'
        }, { status: 408 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate reports. Please try again.'
    }, { status: 500 });
  }
});