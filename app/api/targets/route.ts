// app/api/targets/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { tierQuarterlyTargets } from '@/lib/tierData'; 

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { 
        tier: true,
        transactions: {
          where: { 
            type: { in: ['COMMISSION', 'BONUS'] }, 
            status: 'COMPLETED' 
          },
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    const targetAmount = tierQuarterlyTargets[user.tier] || 0;
    
    // --- CALCULATIONS FOR PROGRESS AND CHART ---
    
    // Calculate progress for the current quarter (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const quarterlyTransactions = user.transactions.filter(tx => tx.createdAt >= threeMonthsAgo);
    const currentProgress = quarterlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Prepare data for the last 6 months for the chart
    const monthlyEarnings: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    // Initialize the last 6 months with 0 earnings
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${monthNames[d.getMonth()]}`; // Use short month name as key
        monthlyEarnings[monthKey] = 0;
    }

    // Populate earnings for the relevant months
    for (const tx of user.transactions) {
        const d = tx.createdAt;
        const monthKey = `${monthNames[d.getMonth()]}`;
        if (monthlyEarnings.hasOwnProperty(monthKey)) {
            monthlyEarnings[monthKey] += tx.amount;
        }
    }
    
    const chartData = Object.entries(monthlyEarnings).map(([key, value]) => ({
      name: key,  // e.g., "Jan", "Feb"
      value: value,
    }));
    // --- END CALCULATIONS ---

    // Prepare a list of all commission transactions for the history table
    const commissionHistory = user.transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      date: tx.createdAt.toISOString(),
      status: tx.status,
    }));

    const responseData = {
      target: targetAmount,
      progress: currentProgress,
      history: commissionHistory,
      chartData: chartData,
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("API_TARGETS_ERROR: ", error);
    if (error instanceof Error && error.name === 'NotFoundError') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}