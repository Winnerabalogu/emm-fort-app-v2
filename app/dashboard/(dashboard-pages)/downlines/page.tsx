import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DownlinesClientComponent from '@/components/dashboard/downlines/DownlinesClientComponent';
import { Tier } from '@prisma/client';

interface Downline {
  id: string;
  name: string;
  tier: Tier;
  joinDate: string;
  status: 'Paid' | 'Unsubscribed';
  earnings: number;
}

export default async function DownlinesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }


  const userWithDownlines = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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

  let formattedDownlines: Downline[] = [];

  if (userWithDownlines) {
    formattedDownlines = await Promise.all(
      userWithDownlines.referredUsers.map(async (downline) => {
        const commissions = await prisma.transaction.findMany({
          where: { userId: session.user.id, type: 'COMMISSION', sourceUserId: downline.id },
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
    formattedDownlines.sort((a, b) => b.earnings - b.earnings);
  }

  return (
    <DownlinesClientComponent initialDownlines={formattedDownlines} />
  );
}