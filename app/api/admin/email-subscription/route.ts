/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/email-subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
export const runtime = 'nodejs';
import type { Prisma } from '@prisma/client';
import { User } from 'next-auth';

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;
    const where: Prisma.EmailSubscriptionWhereInput = {};
    
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }
    
    if (status) where.status = status;
    if (source) where.source = { contains: source, mode: 'insensitive' };
    
    if (dateFrom || dateTo) {
      where.subscribedAt = {};
      if (dateFrom) where.subscribedAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.subscribedAt.lte = toDate;
      }
    }

    const [subscriptions, totalCount, stats] = await Promise.all([
      prisma.emailSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribedAt: 'desc' }
      }),
      prisma.emailSubscription.count({ where }),
      // Calculate stats
      prisma.emailSubscription.groupBy({
        by: ['status'],
        _count: { id: true }
      }).then(async (statusGroups) => {
        const sourceStats = await prisma.emailSubscription.groupBy({
          by: ['source'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        });

        const totalStats = await prisma.emailSubscription.aggregate({
          _count: { id: true }
        });

        const stats = {
          totalSubscriptions: totalStats._count.id,
          activeSubscriptions: 0,
          unsubscribedCount: 0,
          topSources: sourceStats
        };

        statusGroups.forEach(group => {
          if (group.status === 'ACTIVE') {
            stats.activeSubscriptions = group._count.id;
          } else if (group.status === 'UNSUBSCRIBED') {
            stats.unsubscribedCount = group._count.id;
          }
        });

        return stats;
      })
    ]);

    const subscriptionsWithFormattedDates = subscriptions.map(subscription => ({
      ...subscription,
      subscribedAt: subscription.subscribedAt.toISOString(),
      unsubscribedAt: subscription.unsubscribedAt?.toISOString() || null,
      lastEmailSent: subscription.lastEmailSent?.toISOString() || null,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionsWithFormattedDates,
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
    console.error('GET_EMAIL_SUBSCRIPTIONS_ERROR:', error);
    throw new Error('Failed to fetch email subscriptions');
  }
});

export const DELETE = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await prisma.emailSubscription.delete({
      where: { email }
    });

    return NextResponse.json({
      success: true,
      message: 'Email subscription deleted successfully'
    });

  } catch (error) {
    console.error('DELETE_EMAIL_SUBSCRIPTION_ERROR:', error);
    throw new Error('Failed to delete email subscription');
  }
});