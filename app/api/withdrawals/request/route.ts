// app/api/withdrawals/request/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendNewWithdrawalRequestEmail } from '@/lib/email'

const RequestWithdrawalSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const validation = RequestWithdrawalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount, password } = validation.data;

    // 1. Fetch user data, including their password and withdrawal details
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { withdrawalDetails: true, transactions: true },
    });

    // 2. Verify password
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 403 });
    }

    // 3. Verify they have withdrawal details set up
    if (!user.withdrawalDetails) {
      return NextResponse.json({ error: 'You must set up your withdrawal details in Settings first.' }, { status: 400 });
    }

    // 4. Verify they have sufficient balance
    let totalEarned = 0;
    let totalWithdrawn = 0;
    for (const tx of user.transactions) {
      if (tx.type === 'COMMISSION' || tx.type === 'BONUS') totalEarned += tx.amount;
      if (tx.type === 'WITHDRAWAL') totalWithdrawn += tx.amount;
    }
    const balance = totalEarned - totalWithdrawn;

    if (amount > balance) {
      return NextResponse.json({ error: 'Insufficient balance for this withdrawal amount.' }, { status: 400 });
    }

    // 5. All checks passed. Create the withdrawal request.
    const [withdrawalRequest] = await prisma.$transaction([
      prisma.withdrawalRequest.create({
        data: {
          amount,
          userId,
          status: 'PENDING',
        },
      }),
      prisma.transaction.create({
        data: {
          amount,
          userId,
          type: 'WITHDRAWAL',
          status: 'PENDING',
        }
      })
    ]);
    await sendNewWithdrawalRequestEmail(user.email, amount, user.withdrawalDetails);

    return NextResponse.json({ message: 'Withdrawal request submitted successfully!', request: withdrawalRequest });

  } catch (error) {
    console.error("WITHDRAWAL_REQUEST_ERROR: ", error);  
    if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'An internal error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}