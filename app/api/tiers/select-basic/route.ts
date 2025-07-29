import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  
    if (user.subscriptionStartDate) {
        return NextResponse.json({ error: 'User already has an active plan.' }, { status: 409 });
    }

    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(now.getFullYear() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: 'BASIC',
        subscriptionStartDate: now,
        subscriptionExpiryDate: expiryDate,
      },
    });

    return NextResponse.json({ message: 'Basic plan activated successfully.' });

  } catch (error) {
    console.error('BASIC_PLAN_ACTIVATION_ERROR:', error);
    return NextResponse.json({ error: 'Failed to activate plan.' }, { status: 500 });
  }
}