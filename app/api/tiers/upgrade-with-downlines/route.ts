import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';
import { upgradeRequirements } from '@/lib/tierData';
import { auth } from '@/auth'; 
export async function POST(request: Request) {
  // SECURE THIS ENDPOINT
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  
  const { targetTier } = await request.json();

  if (!targetTier) {
    return NextResponse.json({ error: 'Target tier is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { referredUsers: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const requirements = upgradeRequirements[user.tier]?.[targetTier as Tier];
    if (!requirements) {
      return NextResponse.json({ error: 'Invalid upgrade path' }, { status: 400 });
    }

    const paidDownlinesCount = user.referredUsers.filter(u => u.subscriptionStartDate !== null).length;
    if (paidDownlinesCount < requirements.downlines) {
      return NextResponse.json({ error: 'Insufficient paid downlines for this upgrade.' }, { status: 403 });
    }
    
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(now.getFullYear() + 1);
    
    await prisma.$transaction([      
      prisma.user.update({
        where: { id: user.id },
        data: {
          tier: targetTier as Tier,
          subscriptionStartDate: now,
          subscriptionExpiryDate: expiryDate,
        },
      }),      
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'UPGRADE_DOWNLINE', 
          amount: 0,
          status: 'COMPLETED',
        }
      })
    ]);
    // --- END OF TRANSACTION ---
        
    return NextResponse.json({ message: `Successfully upgraded to ${targetTier} using downlines.` });

  } catch (error) {
    console.error('UPGRADE_WITH_DOWNLINES_ERROR:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}