import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params object before accessing its properties
  const { id: downlineId } = await params;

  try {
    const downline = await prisma.user.findFirst({
      where: {
        id: downlineId,
        uplinerId: session.user.id,
      },
      select: {
        fullName: true,
        email: true,
        phone: true,
        tier: true,
        subscriptionStartDate: true,
        createdAt: true,
      },
    });

    if (!downline) {
      return NextResponse.json(
        { error: 'Downline not found or unauthorized.' },
        { status: 404 }
      );
    }

    const commissions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'COMMISSION',
        sourceUserId: downlineId,
      },
      select: { amount: true },
    });

    const totalEarnings = commissions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({ ...downline, totalEarnings });
  } catch (error) {
    console.error(`ERROR_FETCHING_DOWNLINE_${downlineId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}