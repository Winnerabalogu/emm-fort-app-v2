// app/api/admin/commissions/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { processCommissions } from '@/lib/commissionService';
import { Prisma } from '@prisma/client';

const ManualCommissionSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['COMMISSION', 'BONUS']).default('COMMISSION'),
  sourceUserId: z.string().optional(),
  description: z.string().optional()
});

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for commissions
      const where: Prisma.TransactionWhereInput = {};

    if (userId) where.userId = userId;
    if (type && type !== 'all') where.type = type.toUpperCase();
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }
    
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { sourceUser: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [commissions, totalCount, summaryStats, topEarners] = await Promise.all([
      // Get commissions with user details
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              tier: true
            }
          },
          sourceUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
              tier: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      
      // Total count
      prisma.transaction.count({ where }),
      
      // Summary statistics
      prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      
      // Top commission earners this month
      prisma.transaction.groupBy({
        by: ['userId'],
        where: {
          type: { in: ['COMMISSION', 'BONUS'] },
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 10
      })
    ]);

    // Get user details for top earners
    const topEarnersWithDetails = await Promise.all(
      topEarners.map(async (earner) => {
        const user = await prisma.user.findUnique({
          where: { id: earner.userId },
          select: {
            id: true,
            fullName: true,
            username: true,
            tier: true,
            email: true
          }
        });
        return {
          user,
          totalCommissions: earner._sum.amount || 0,
          transactionCount: earner._count
        };
      })
    );

    // Get commission type breakdown
    const typeBreakdown = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        ...where,
        type: { in: ['COMMISSION', 'BONUS'] }
      },
      _sum: { amount: true },
      _count: true
    });

    return NextResponse.json({
      success: true,
      data: {
        commissions: commissions.map(comm => ({
          ...comm,
          createdAt: comm.createdAt.toISOString()
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        stats: {
          totalCommissions: summaryStats._sum.amount || 0,
          totalCount: summaryStats._count,
          topEarners: topEarnersWithDetails,
          typeBreakdown: typeBreakdown.reduce((acc, item) => {
            acc[item.type] = {
              count: item._count,
              amount: item._sum.amount || 0
            };
            return acc;
          }, {} as Record<string, { count: number; amount: number }>)
        }
      }
    });

  } catch (error) {
    console.error('ADMIN_COMMISSIONS_FETCH_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commission data'
    }, { status: 500 });
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validation = ManualCommissionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { userId, amount, type, sourceUserId, description } = validation.data;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, tier: true }
    });

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'Target user not found'
      }, { status: 404 });
    }

    // Verify source user if provided
    if (sourceUserId) {
      const sourceUser = await prisma.user.findUnique({
        where: { id: sourceUserId },
        select: { id: true }
      });
      
      if (!sourceUser) {
        return NextResponse.json({
          success: false,
          error: 'Source user not found'
        }, { status: 404 });
      }
    }

    // Create manual commission transaction
    const commission = await prisma.transaction.create({
      data: {
        type,
        amount,
        status: 'COMPLETED',
        userId,
        sourceUserId: sourceUserId || null,
        description: description || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            tier: true
          }
        },
        sourceUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
            tier: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Manual commission created successfully',
      data: {
        ...commission,
        createdAt: commission.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('ADMIN_CREATE_COMMISSION_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create manual commission'
    }, { status: 500 });
  }
});

// Bulk commission processing endpoint
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { sourceUserId, amount } = body;

    if (!sourceUserId || !amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Source user ID and positive amount are required'
      }, { status: 400 });
    }

    // Verify source user exists
    const sourceUser = await prisma.user.findUnique({
      where: { id: sourceUserId },
      select: { id: true, fullName: true, tier: true }
    });

    if (!sourceUser) {
      return NextResponse.json({
        success: false,
        error: 'Source user not found'
      }, { status: 404 });
    }

    // Process commissions using existing service
    await processCommissions(sourceUserId, amount);

    return NextResponse.json({
      success: true,
      message: 'Commissions processed successfully'
    });

  } catch (error) {
    console.error('ADMIN_PROCESS_COMMISSIONS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process commissions'
    }, { status: 500 });
  }
});