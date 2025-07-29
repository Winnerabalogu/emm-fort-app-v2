// app/api/downlines/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const uplinerId = session.user.id;
    const userWithDownlines = await prisma.user.findUnique({
      where: { id: uplinerId },
      select: {
        // We only need the list of users they referred.
        referredUsers: {
          select: {
            id: true,
            fullName: true,
            tier: true,
            createdAt: true,
            subscriptionStartDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!userWithDownlines || userWithDownlines.referredUsers.length === 0) {
      return NextResponse.json([]); 
    }    
    const downlinesWithEarnings = await Promise.all(
      userWithDownlines.referredUsers.map(async (downline) => {        
        const commissions = await prisma.transaction.findMany({
          where: {
            userId: uplinerId,       
            type: 'COMMISSION',
            sourceUserId: downline.id, 
          },
          select: { amount: true },
        });        
        const totalEarningsFromDownline = commissions.reduce((sum, t) => sum + t.amount, 0);

        return {
          id: downline.id,
          name: downline.fullName,
          tier: downline.tier,
          joinDate: downline.createdAt.toISOString(),
          status: downline.subscriptionStartDate ? 'Paid' : 'Unsubscribed',
          earnings: totalEarningsFromDownline, 
        };
      })
    );    
    downlinesWithEarnings.sort((a, b) => b.earnings - a.earnings);

    return NextResponse.json(downlinesWithEarnings);

  } catch (error) {
    console.error('GET_DOWNLINES_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch downlines.' }, { status: 500 });
  }
}