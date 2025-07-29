// lib/commissionService.ts
import { prisma } from './prisma';
import { commissionRates } from './tierData';

/**
 * Calculates and awards commissions after a successful payment.
 * @param newUserId The ID of the user who triggered the payment.
 * @param paymentAmount The actual amount paid (in Naira).
 */
export async function processCommissions(newUserId: string, paymentAmount: number) {  
  
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    include: { 
      upliner: { include: { upliner: true } } 
    },
  });

  if (!newUser || !newUser.upliner) {    
    return;
  }
  
  if (!paymentAmount || paymentAmount <= 0) {      
      return;
  }

  // --- Process Primary Commission ---
  const primaryUpliner = newUser.upliner;
  const primaryRates = commissionRates[primaryUpliner.tier];
  const primaryCommissionAmount = paymentAmount * primaryRates.primary;

  if (primaryCommissionAmount > 0) {
    await prisma.transaction.create({
      data: {
        type: 'COMMISSION',
        amount: primaryCommissionAmount,
        status: 'COMPLETED',
        userId: primaryUpliner.id,
        sourceUserId: newUser.id,
      },
    });    
  }

  // --- Process Secondary Commission ---
  const grandUpliner = primaryUpliner.upliner;
  if (grandUpliner) {
    const secondaryRates = commissionRates[grandUpliner.tier];
    const secondaryCommissionAmount = paymentAmount * secondaryRates.secondary;

    if (secondaryCommissionAmount > 0) {
      await prisma.transaction.create({
        data: {
          type: 'COMMISSION',
          amount: secondaryCommissionAmount,
          status: 'COMPLETED',
          userId: grandUpliner.id,
          sourceUserId: newUser.id,
        },
      });      
    }
  }
}