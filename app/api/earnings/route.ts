// app/api/earnings/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // OPTIMIZATION: Get all earnings transactions in one query (preserves original behavior)
    const earningsTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: { in: ['COMMISSION', 'BONUS'] },
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Preserve original calculation logic exactly
    let totalEarned = 0;
    let commissionEarnings = 0;
    let bonusEarnings = 0;

    for (const tx of earningsTransactions) {
      totalEarned += tx.amount;
      if (tx.type === 'COMMISSION') {
        commissionEarnings += tx.amount;
      } else if (tx.type === 'BONUS') {
        bonusEarnings += tx.amount;
      }
    }

    // Return exact same structure as original
    const response = NextResponse.json({
      totalEarned,
      commissionEarnings,
      bonusEarnings,
      history: earningsTransactions, // Exact same field name and structure
    });

    // Add performance optimization: cache headers
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    
    return response;

  } catch (error) {
    console.error('GET_EARNINGS_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings data.' }, { status: 500 });
  }
}