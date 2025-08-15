/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/savings/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { User } from 'next-auth';

const UpdateSaveRequestSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  adminNote: z.string().optional()
});

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.SaveRequestWhereInput = {};
    if (status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { purpose: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [saveRequests, totalCount, stats] = await Promise.all([
      prisma.saveRequest.findMany({
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      
      prisma.saveRequest.count({ where }),
      
      // Get summary stats
      prisma.saveRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true }
      })
    ]);

    // Format stats for frontend
    const summaryStats = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase() as keyof typeof summaryStats;
      if (status !== 'total') {
        summaryStats[status] = {
          count: stat._count._all,
          amount: stat._sum.amount || 0
        };
        summaryStats.total.count += stat._count._all;
        summaryStats.total.amount += stat._sum.amount || 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        saveRequests: saveRequests.map(req => ({
          ...req,
          createdAt: req.createdAt.toISOString(),
          updatedAt: req.updatedAt.toISOString()
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        stats: summaryStats
      }
    });

  } catch (error) {
    console.error('ADMIN_SAVINGS_FETCH_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch save requests'
    }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    const validation = UpdateSaveRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { id, status, adminNote } = validation.data;

    // Update save request within transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the save request
      const updatedSaveRequest = await tx.saveRequest.update({
        where: { id },
        data: {
          status,
          adminNote: adminNote || null,
          updatedAt: new Date()
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
          }
        }
      });

      // Update related transaction if exists
      await tx.transaction.updateMany({
        where: {
          userId: updatedSaveRequest.userId,
          type: 'SAVING',
          amount: updatedSaveRequest.amount,
          status: 'PENDING'
        },
        data: {
          status: status === 'APPROVED' ? 'COMPLETED' : status === 'REJECTED' ? 'FAILED' : 'PENDING'
        }
      });

      return updatedSaveRequest;
    });

    return NextResponse.json({
      success: true,
      message: `Save request ${status.toLowerCase()} successfully`,
      data: {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('ADMIN_SAVINGS_UPDATE_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update save request'
    }, { status: 500 });
  }
});