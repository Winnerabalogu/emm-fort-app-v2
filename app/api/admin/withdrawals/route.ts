export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const GET = withAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;
    const where: Prisma.WithdrawalRequestWhereInput = {};
    
    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    if (status) where.status = status;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [withdrawals, totalCount, stats] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              tier: true,
              withdrawalDetails: true
            }
          }
        }
      }),
      prisma.withdrawalRequest.count({ where }),
      // Calculate stats
      prisma.withdrawalRequest.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true }
      }).then(async (statusGroups) => {
        const totalStats = await prisma.withdrawalRequest.aggregate({
          _count: { id: true },
          _sum: { amount: true }
        });

        const stats = {
          totalRequests: totalStats._count.id,
          totalAmount: totalStats._sum.amount || 0,
          pendingRequests: 0,
          pendingAmount: 0,
          completedRequests: 0,
          completedAmount: 0
        };

        statusGroups.forEach(group => {
          if (group.status === 'PENDING') {
            stats.pendingRequests = group._count.id;
            stats.pendingAmount = group._sum.amount || 0;
          } else if (['APPROVED', 'COMPLETED'].includes(group.status)) {
            stats.completedRequests += group._count.id;
            stats.completedAmount += group._sum.amount || 0;
          }
        });

        return stats;
      })
    ]);

    const withdrawalsWithFormattedDates = withdrawals.map(withdrawal => ({
      ...withdrawal,
      createdAt: withdrawal.createdAt.toISOString(),
      updatedAt: withdrawal.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: withdrawalsWithFormattedDates,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      },
      stats
    });

  } catch (error) {
    console.error('GET_WITHDRAWALS_ERROR:', error);
    throw new Error('Failed to fetch withdrawals');
  }
});