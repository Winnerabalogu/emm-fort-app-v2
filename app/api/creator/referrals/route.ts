// app/api/creator/referrals/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session?.user?.isCreator) {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    const userId = session.user.id;

    // Get user data for referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral statistics
    const [
      totalReferrals,
      activeReferrals,
      totalEarningsData,
      thisMonthEarningsData,
      recentReferrals
    ] = await Promise.all([
      // Total referral count
      prisma.user.count({
        where: {
          uplinerId: userId,
          emailVerified: { not: null }
        }
      }),

      // Active referrals (with active subscriptions)
      prisma.user.count({
        where: {
          uplinerId: userId,
          emailVerified: { not: null },
          subscriptionExpiryDate: { gte: new Date() }
        }
      }),

      // Total earnings from referral commissions
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // This month's referral earnings
      prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'COMMISSION',
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }),

      // Recent referrals
      prisma.user.findMany({
        where: {
          uplinerId: userId,
          emailVerified: { not: null }
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          tier: true,
          createdAt: true,
          subscriptionExpiryDate: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const totalEarnings = totalEarningsData._sum.amount || 0;
    const thisMonthEarnings = thisMonthEarningsData._sum.amount || 0;
    
    // Calculate conversion rate
    const conversionRate = totalReferrals > 0 
      ? ((activeReferrals / totalReferrals) * 100).toFixed(1)
      : "0.0";

    // Generate referral code and link
    const referralCode = `${user.username?.toUpperCase()}${new Date().getFullYear()}`;
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralLink,
      totalReferrals,
      activeReferrals,
      totalEarnings: Number(totalEarnings),
      thisMonthEarnings: Number(thisMonthEarnings),
      conversionRate,
      recentReferrals: recentReferrals.map(ref => ({
        id: ref.id,
        name: ref.fullName,
        username: ref.username,
        tier: ref.tier,
        joinedAt: ref.createdAt.toISOString(),
        isActive: ref.subscriptionExpiryDate && ref.subscriptionExpiryDate > new Date()
      }))
    });

  } catch (error) {
    console.error("CREATOR_REFERRALS_API_ERROR:", error);
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    );
  }
}