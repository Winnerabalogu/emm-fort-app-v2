// app/api/admin/tiers/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const UpdateUserTierSchema = z.object({
  userId: z.string(),
  newTier: z.enum(['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
  extendSubscription: z.boolean().default(false),
  reason: z.string().optional()
});

export const GET = withAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const includeSummary = searchParams.get('summary') === 'true';
    
    if (includeSummary) {
      // Get tier distribution and statistics
      const [tierDistribution, recentUpgrades, subscriptionStats] = await Promise.all([
        // Count users by tier
        prisma.user.groupBy({
          by: ['tier'],
          _count: { _all: true },
          orderBy: { tier: 'asc' }
        }),
        
        // Recent tier changes (last 30 days)
        prisma.user.findMany({
          where: {
            subscriptionStartDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            tier: true,
            subscriptionStartDate: true,
            subscriptionExpiryDate: true
          },
          orderBy: { subscriptionStartDate: 'desc' },
          take: 10
        }),
        
        // Active subscription stats
        prisma.user.aggregate({
          where: {
            AND: [
              { subscriptionStartDate: { not: null } },
              { subscriptionExpiryDate: { gte: new Date() } }
            ]
          },
          _count: { _all: true }
        })
      ]);

      // Calculate revenue by tier (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const revenueByTier = await prisma.transaction.groupBy({
        by: ['userId'],
        where: {
          type: { in: ['SUBSCRIPTION_FEE', 'UPGRADE_FEE'] },
          status: 'COMPLETED',
          createdAt: { gte: threeMonthsAgo }
        },
        _sum: { amount: true }
      });

      // Get user tiers for revenue calculation
      const userTiers = await prisma.user.findMany({
        where: { 
          id: { in: revenueByTier.map(r => r.userId) }
        },
        select: { id: true, tier: true }
      });

      const tierRevenue = userTiers.reduce((acc, user) => {
        const revenue = revenueByTier.find(r => r.userId === user.id)?._sum.amount || 0;
        acc[user.tier] = (acc[user.tier] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        success: true,
        data: {
          tierDistribution: tierDistribution.reduce((acc, item) => {
            acc[item.tier] = item._count._all;
            return acc;
          }, {} as Record<string, number>),
          recentUpgrades: recentUpgrades.map(user => ({
            ...user,
            subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
            subscriptionExpiryDate: user.subscriptionExpiryDate?.toISOString()
          })),
          activeSubscriptions: subscriptionStats._count._all,
          tierRevenue
        }
      });
    }

    // Default: return tier configuration
    const { tiersData, tierPrices, commissionRates } = await import('@/lib/tierData');
    
    return NextResponse.json({
      success: true,
      data: {
        tiers: tiersData,
        prices: tierPrices,
        commissionRates
      }
    });

  } catch (error) {
    console.error('ADMIN_TIERS_FETCH_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tier data'
    }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (req) => {
  try {
    const body = await req.json();
    const validation = UpdateUserTierSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { userId, newTier, extendSubscription, reason } = validation.data;

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        tier: true,
        subscriptionStartDate: true,
        subscriptionExpiryDate: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<Prisma.UserUpdateInput> = { tier: newTier };

    // Handle subscription extension
    if (extendSubscription) {
      const currentExpiry = currentUser.subscriptionExpiryDate;
      const newExpiryDate = new Date();
      
      if (currentExpiry && currentExpiry > now) {
        // Extend from current expiry
        newExpiryDate.setTime(currentExpiry.getTime());
      } else {
        // Start from now if expired or no subscription
        updateData.subscriptionStartDate = now;
      }
      
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
      updateData.subscriptionExpiryDate = newExpiryDate;
    }

    // Update user tier within transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          tier: true,
          subscriptionStartDate: true,
          subscriptionExpiryDate: true
        }
      }),
      
      // Create transaction log for tier change
      prisma.transaction.create({
        data: {
          type: 'MANUAL_ADJUSTMENT',
          amount: 0,
          status: 'COMPLETED',
          userId: userId,
           description: reason || `Tier updated to ${newTier}`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `User tier updated to ${newTier} successfully`,
      data: {
        user: {
          ...updatedUser,
          subscriptionStartDate: updatedUser.subscriptionStartDate?.toISOString(),
          subscriptionExpiryDate: updatedUser.subscriptionExpiryDate?.toISOString()
        },
        previousTier: currentUser.tier,
        changes: {
          tierChanged: currentUser.tier !== newTier,
          subscriptionExtended: extendSubscription,
          reason
        }
      }
    });

  } catch (error) {
    console.error('ADMIN_UPDATE_TIER_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user tier'
    }, { status: 500 });
  }
});

// Bulk tier operations
export const PUT = withAdmin(async (req) => {
  try {
    const body = await req.json();
    const { operation, userIds, targetTier, extendSubscription } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User IDs array is required'
      }, { status: 400 });
    }

    if (operation === 'bulkTierUpdate' && !targetTier) {
      return NextResponse.json({
        success: false,
        error: 'Target tier is required for bulk update'
      }, { status: 400 });
    }

    const results = await prisma.$transaction(async (tx) => {
      const updates = [];
      
      for (const userId of userIds) {
         const updateData: Partial<Prisma.UserUpdateInput> = {};

        if (targetTier) {
          updateData.tier = targetTier;
        }
        
        if (extendSubscription) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { subscriptionExpiryDate: true }
          });
          
          const now = new Date();
          const newExpiryDate = new Date();
          
          if (user?.subscriptionExpiryDate && user.subscriptionExpiryDate > now) {
            newExpiryDate.setTime(user.subscriptionExpiryDate.getTime());
          } else {
            updateData.subscriptionStartDate = now;
          }
          
          newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
          updateData.subscriptionExpiryDate = newExpiryDate;
        }

        if (Object.keys(updateData).length > 0) {
          const updated = await tx.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, fullName: true, tier: true }
          });
          updates.push(updated);
        }
      }
      
      return updates;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${results.length} users`,
      data: { updatedUsers: results }
    });

  } catch (error) {
    console.error('ADMIN_BULK_TIER_UPDATE_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform bulk tier operation'
    }, { status: 500 });
  }
});