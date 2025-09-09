export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { clearUserCache } from '@/auth';

const WithdrawalDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required.'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session?.user?.isCreator) {
    return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
  }

  try {
    const withdrawalDetails = await prisma.withdrawalDetails.findUnique({
      where: { userId: session.user.id },
    });

    if (!withdrawalDetails) {
      // Return default/empty data if not found, so the form can initialize
      return NextResponse.json({
        bankName: '',
        accountNumber: '',
        firstName: '',
        lastName: '',
      });
    }

    return NextResponse.json(withdrawalDetails);
  } catch (error) {
    console.error("GET_WITHDRAWAL_DETAILS_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to load withdrawal details.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session?.user?.isCreator) {
    return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = WithdrawalDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { bankName, accountNumber, firstName, lastName } = validation.data;

    // Use upsert to either create or update the withdrawal details
    await prisma.withdrawalDetails.upsert({
      where: { userId: session.user.id },
      update: {
        bankName,
        accountNumber,
        firstName,
        lastName,
      },
      create: {
        userId: session.user.id,
        bankName,
        accountNumber,
        firstName,
        lastName,
      },
    });

    clearUserCache(session.user.id);
    return NextResponse.json({ message: "Withdrawal details updated successfully." });

  } catch (error) {
    console.error("UPDATE_WITHDRAWAL_DETAILS_ERROR:", error);
    return NextResponse.json({ error: 'Failed to update withdrawal details due to a server error.' }, { status: 500 });
  }
}