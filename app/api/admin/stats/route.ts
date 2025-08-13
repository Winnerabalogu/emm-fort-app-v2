// app/api/admin/stats/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';

export const GET = withAdmin(async () => {
  try {
    // Get date ranges for calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      activeSubscribers,
      newUsersToday,
      newUsersThisMonth,
      newUsersLastMonth,
      recentUsers,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      pendingWithdrawalsCount,
      pendingWithdrawalRequests,
      transactionsToday,
      recentTransactions
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscribers (users with valid subscription)
      prisma.user.count({
        where: {
          AND: [
            { subscriptionStartDate: { not: null } },
            { subscriptionExpiryDate: { gte: now } }
          ]
        }
      }),
      
      // New users today
      prisma.user.count({
        where: {
          createdAt: { gte: startOfToday }
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // New users last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      
      // Recent users (last 10)
      prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          tier: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Total revenue from completed transactions
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: {
            in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION']
          }
        },
        _sum: { amount: true }
      }),
      
      // Monthly revenue
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: {
            in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION']
          },
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      
      // Last month revenue
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: {
            in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION']
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Pending withdrawals count
      prisma.withdrawalRequest.count({
        where: { status: 'PENDING' }
      }),
      
      // Recent pending withdrawal requests
      prisma.withdrawalRequest.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Transactions today
      prisma.transaction.count({
        where: {
          createdAt: { gte: startOfToday }
        }
      }),
      
      // Recent transactions
      prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Calculate growth percentages
    const userGrowthPercentage = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : newUsersThisMonth > 0 ? 100 : 0;

    const currentMonthRevenue = monthlyRevenue._sum.amount || 0;
    const previousMonthRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueGrowthPercentage = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;

    const statsData = {
      totalUsers,
      activeSubscribers,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingWithdrawals: pendingWithdrawalsCount,
      monthlyRevenue: currentMonthRevenue,
      transactionsToday,
      newUsersToday,
      userGrowthPercentage: Math.round(userGrowthPercentage * 10) / 10,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 10) / 10,
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString()
      })),
      pendingWithdrawalRequests: pendingWithdrawalRequests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString()
      })),
      recentTransactions: recentTransactions.map(transaction => ({
        ...transaction,
        createdAt: transaction.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('ADMIN_STATS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    }, { status: 500 });
  }
});