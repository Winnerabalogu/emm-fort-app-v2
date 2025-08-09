export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionSuccessEmail } from '@/lib/email'; 

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }    
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
      
    if (user.tier === 'BASIC' && user.subscriptionStartDate) {
      return NextResponse.json({ 
        message: 'Basic plan is already active.',
        alreadyActive: true 
      }, { status: 200 });
    }
    
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(now.getFullYear() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: 'BASIC',
        subscriptionStartDate: now,
        subscriptionExpiryDate: expiryDate,
      },
    });

    // Send subscription success email
    try {
      await sendSubscriptionSuccessEmail(updatedUser.email, 'BASIC', expiryDate);
      console.log(`Subscription success email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send subscription email:', emailError);
      // Don't fail the whole operation if email fails
    }

    console.log(`BASIC tier activated for user: ${email}`);

    return NextResponse.json({ 
      message: 'Basic plan activated successfully.',
      tier: updatedUser.tier,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionExpiryDate: updatedUser.subscriptionExpiryDate
    });

  } catch (error) {
    console.error('BASIC_PLAN_ACTIVATION_ERROR:', error);
    return NextResponse.json({ error: 'Failed to activate plan.' }, { status: 500 });
  }
}