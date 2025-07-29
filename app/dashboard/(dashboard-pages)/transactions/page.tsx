// app/dashboard/transactions/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TransactionsTable from '@/components/dashboard/transactions/TransactionsTable';
import { redirect } from 'next/navigation';
import { Transaction, TransactionType, TransactionStatus } from '@/lib/types'; 

export default async function TransactionsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }
  
  const userTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  const formattedTransactions: Transaction[] = userTransactions.map(tx => ({
    id: tx.id,
    type: tx.type as TransactionType,
    amount: tx.amount,
    date: tx.createdAt.toISOString(),
    status: tx.status as TransactionStatus,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transaction History</h1>
        <p className="text-text-secondary mt-1">View all your financial activities, including earnings and withdrawals.</p>
      </div>         
      <TransactionsTable initialTransactions={formattedTransactions} />
    </div>
  );
}