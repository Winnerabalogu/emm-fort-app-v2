// app/api/earnings/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {    
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
    
    return NextResponse.json({
      totalEarned,
      commissionEarnings,
      bonusEarnings,
      history: earningsTransactions, 
    });

  } catch (error) {
    console.error('GET_EARNINGS_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings data.' }, { status: 500 });
  }
}