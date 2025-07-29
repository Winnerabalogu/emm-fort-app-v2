/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { Tier } from '.prisma/client';
import { sendSubscriptionSuccessEmail, sendUpgradeSuccessEmail } from '@/lib/email';
import { processCommissions } from '@/lib/commissionService';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function isValidTier(value: unknown): value is Tier {
  if (typeof value !== 'string') return false;
  const validTiers: ReadonlyArray<string> = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  return validTiers.includes(value.toUpperCase());
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  
  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY is not set.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    console.error('Webhook Error: Invalid Paystack signature.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event: { event?: string; data?: any } = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const data = event.data;
    
    if (data?.status !== 'success') {
      return NextResponse.json({ message: 'Charge not successful.' }, { status: 200 });
    }

    const { metadata, reference, amount } = data;
    const userId = metadata?.userId;
    const tierNameFromWebhook = metadata?.tierName;
    const purpose = metadata?.purpose;

    if (typeof userId !== 'string' || !userId) {
        console.error('Webhook Error: Missing or invalid userId in metadata', metadata);
        return NextResponse.json({ error: 'Missing or invalid userId' }, { status: 200 });
    }
    
    const normalizedTier = typeof tierNameFromWebhook === 'string' ? tierNameFromWebhook.toUpperCase() : null;
    if (!isValidTier(normalizedTier)) {
      console.error('Webhook Error: Missing or invalid tierName in metadata', metadata);
      return NextResponse.json({ error: 'Missing or invalid tierName' }, { status: 200 });
    }
    
    try {
      const userBeforeUpdate = await prisma.user.findUnique({ where: { id: userId }});
      if (!userBeforeUpdate) {
        throw new Error(`User with ID ${userId} not found during webhook processing.`);
      }

      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(now.getFullYear() + 1);
      const amountInNaira = amount / 100;      
      const [updatedUser] = await prisma.$transaction([        
        prisma.user.update({
          where: { id: userId },
          data: {
            tier: normalizedTier,
            subscriptionStartDate: now,
            subscriptionExpiryDate: expiryDate,
            subscriptionId: reference,
          },
        }),        
        prisma.transaction.create({
          data: {
            userId: userId,
            type: purpose === 'Subscription_Upgrade' ? 'UPGRADE_FEE' : 'SUBSCRIPTION_FEE',
            amount: amountInNaira,
            status: 'COMPLETED',
          }
        })
      ]);
        await processCommissions(updatedUser.id, amountInNaira);      
      // --- END OF TRANSACTION ---

      if (purpose === 'Subscription_Upgrade') {
        await sendUpgradeSuccessEmail(updatedUser.email, userBeforeUpdate.tier, updatedUser.tier, expiryDate);        
      } else {
        await sendSubscriptionSuccessEmail(updatedUser.email, updatedUser.tier, expiryDate);        
      }

    } catch (error) {
      console.error(`Failed to process webhook for user ${userId}:`, error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'success' }, { status: 200 });
}