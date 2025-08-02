export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { upgradeRequirements } from '@/lib/tierData';
import { Tier } from '@prisma/client';

const TIER_HIERARCHY: ReadonlyArray<Tier> = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

     const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        referredUsers: {
          select: {
            subscriptionStartDate: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }    

    const totalDownlines = user.referredUsers.length;
    const paidDownlines = user.referredUsers.filter(u => u.subscriptionStartDate !== null).length;        
    const commissionTransactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        type: 'COMMISSION',
        sourceUserId: { not: null }, 
      },
      select: { amount: true },
    });
    const totalEarnings = commissionTransactions.reduce((sum, tx) => sum + tx.amount, 0);        
    // --- REFINED LOGIC for finding next upgrade goal ---
    let nextUpgradeGoal = null;
    const currentTierIndex = TIER_HIERARCHY.indexOf(user.tier);

    // Check if the user is not already at the highest tier.
    if (currentTierIndex < TIER_HIERARCHY.length - 1) {
        const nextTier = TIER_HIERARCHY[currentTierIndex + 1];
        const requirements = upgradeRequirements[user.tier]?.[nextTier];
        
        if (requirements) {
            nextUpgradeGoal = {
                targetTier: nextTier,
                needed: requirements.downlines,
            };
        }
    }
    // --- END REFINEMENT ---

    return NextResponse.json({
      totalDownlines,
      paidDownlines,
      totalEarnings,
      currentTier: user.tier,
      nextUpgradeGoal,
    });

  } catch (error) {
    console.error("GET_DOWNLINE_STATS_ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch downline stats' }, { status: 500 });
  }
}