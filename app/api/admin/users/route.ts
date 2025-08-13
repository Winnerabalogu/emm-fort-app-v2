// app/api/admin/users/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { Prisma, Tier } from '@prisma/client';

export const GET = withAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const search = url.searchParams.get('search');
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fix tier type issue
    if (tier && Object.values(Tier).includes(tier as Tier)) {
      where.tier = tier as Tier;
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'verified':
          where.emailVerified = { not: null }; // Fix: use emailVerified instead of isVerified
          break;
        case 'unverified':
          where.emailVerified = null; // Fix: use emailVerified instead of isVerified
          break;
        case 'active':
          where.AND = [
            { subscriptionStartDate: { not: null } },
            { subscriptionExpiryDate: { gte: now } }
          ];
          break;
        case 'expired':
          where.subscriptionExpiryDate = { lt: now };
          break;
      }
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [users, totalCount, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          tier: true,
          emailVerified: true,
          subscriptionStartDate: true,
          subscriptionExpiryDate: true,
          createdAt: true,
          role: true,
          _count: {
            select: { referredUsers: true }
          }
        }
      }),
      prisma.user.count({ where }),
      // Stats for dashboard - Fix the aggregate type issue
      (async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const [totalUsers, verifiedUsers, activeSubscribers, totalCommissions, newUsersThisMonth] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { emailVerified: { not: null } } }), // Fix: direct count instead of aggregate
          prisma.user.count({
            where: {
              AND: [
                { subscriptionStartDate: { not: null } },
                { subscriptionExpiryDate: { gte: now } }
              ]
            }
          }),
          prisma.transaction.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
          }),
          prisma.user.count({
            where: { createdAt: { gte: startOfMonth } }
          })
        ]);

        return {
          totalUsers,
          verifiedUsers,
          activeSubscribers,
          totalCommissions: totalCommissions._sum.amount || 0,
          newUsersThisMonth
        };
      })()
    ]);

    // Add commission totals for each user
    const userIds = users.map(u => u.id);
    const commissionTotals = await prisma.transaction.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const usersWithCommissions = users.map(user => ({
      ...user,
      phoneNumber: user.phone, // Map phone to phoneNumber for frontend
      isVerified: !!user.emailVerified, // Convert to boolean
      totalCommissions: commissionTotals.find(c => c.userId === user.id)?._sum.amount || 0,
      directReferrals: user._count.referredUsers, 
      createdAt: user.createdAt.toISOString(),
      subscriptionStartDate: user.subscriptionStartDate?.toISOString() || null,
      subscriptionExpiryDate: user.subscriptionExpiryDate?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithCommissions,
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
    console.error('GET_USERS_ERROR:', error);
    throw new Error('Failed to fetch users');
  }
});

export const PATCH = withAdmin(async (req) => {
  try {
    const body = await req.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'User ID and action are required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailVerified: true, tier: true, role: true ,subscriptionExpiryDate: true, subscriptionStartDate: true, phone: true, fullName: true, email: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // eslint-disable-next-line prefer-const
    let updateData: Prisma.UserUpdateInput = {};

    switch (action) {
      case 'verify':
        updateData.emailVerified = new Date();
        break;
        
      case 'unverify':
        updateData.emailVerified = null;
        break;
        
      case 'update_tier':
        if (!data?.tier || !Object.values(Tier).includes(data.tier)) {
          return NextResponse.json({
            success: false,
            error: 'Valid tier is required'
          }, { status: 400 });
        }
        updateData.tier = data.tier;
        break;

      case 'update_profile':
        if (data?.fullName) updateData.fullName = data.fullName;
        if (data?.email) updateData.email = data.email.toLowerCase();
        if (data?.phoneNumber) updateData.phone = data.phoneNumber;
        break;
        
      case 'extend_subscription':
        if (!data?.months || typeof data.months !== 'number' || data.months <= 0) {
          return NextResponse.json({
            success: false,
            error: 'Valid number of months is required'
          }, { status: 400 });
        }
        
        const currentExpiry = user.subscriptionExpiryDate || new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + data.months);
        
        updateData.subscriptionExpiryDate = newExpiry;
        if (!user.subscriptionStartDate) {
          updateData.subscriptionStartDate = new Date();
        }
        break;
        
      case 'revoke_subscription':
        updateData.subscriptionExpiryDate = new Date(); // Set to current date to expire immediately
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        tier: true,
        emailVerified: true,
        subscriptionStartDate: true,
        subscriptionExpiryDate: true,
        createdAt: true,
        role: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${action.replace('_', ' ')} successful`,
      user: {
        ...updatedUser,
        phoneNumber: updatedUser.phone,
        isVerified: !!updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        subscriptionStartDate: updatedUser.subscriptionStartDate?.toISOString() || null,
        subscriptionExpiryDate: updatedUser.subscriptionExpiryDate?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('UPDATE_USER_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
});