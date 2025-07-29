import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tierPrices, upgradeFees } from '@/lib/tierData';
import { Tier } from '@prisma/client';

function isValidTier(value: string): value is Tier {
    return Object.keys(Tier).includes(value);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function POST(request: Request) {
   try {
    const { email, tierName } = await request.json();

    if (!email || typeof tierName !== 'string') {
      return NextResponse.json({ error: 'Email and Tier Name are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

     const targetTier = tierName.toUpperCase();

  
    if (!isValidTier(targetTier)) {
        return NextResponse.json({ error: 'Invalid tier specified.' }, { status: 400 });
    }

    let amountInNaira: number;
    let paymentPurpose: string;
    let callback_url: string;

    // --- THIS IS THE NEW CORE LOGIC ---
    if (user.subscriptionStartDate) {
      paymentPurpose = 'Subscription_Upgrade';
      callback_url = `${siteUrl}/upgrade-success`;
      const upgradeFee = upgradeFees[user.tier]?.[targetTier as Tier];

      if (upgradeFee === undefined) {
        return NextResponse.json({ error: 'Invalid upgrade path.' }, { status: 400 });
      }
      amountInNaira = upgradeFee;

    } else {
      // This is the user's first subscription.
      paymentPurpose = 'Initial_Subscription';
      callback_url = `${siteUrl}/auth/payment-success`;
      const initialPrice = tierPrices[targetTier as Tier];

      if (initialPrice === undefined) {
        return NextResponse.json({ error: 'Invalid tier selected.' }, { status: 400 });
      }
      amountInNaira = initialPrice;
    }
    // --- END CORE LOGIC ---

    if (amountInNaira <= 0) {
      return NextResponse.json({ error: 'No payment required for this selection.' }, { status: 400 });
    }

    const amountInKobo = amountInNaira * 100;
    const paystackUrl = 'https://api.paystack.co/transaction/initialize';
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    const payload = {
      email: user.email,
      amount: amountInKobo,
      metadata: {
        userId: user.id,
        tierName: targetTier,
        purpose: paymentPurpose, 
      },
      callback_url: callback_url,
    };

    const paystackResponse = await fetch(paystackUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await paystackResponse.json();
    if (!paystackResponse.ok || !data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url });

  } catch (error) {
    console.error('PAYMENT_INIT_ERROR:', error);
    return NextResponse.json({ error: 'Could not create payment session.' }, { status: 500 });
  }
}
