// app/api/user/security/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// --- Schema for Changing Password ---
const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = ChangePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the current password
    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 403 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}

// --- Schema for Withdrawal Details ---
const WithdrawalDetailsSchema = z.object({
    bankName: z.string().min(2, "Bank name is required."),
    accountNumber: z.string().min(10, "A valid 10-digit account number is required.").max(10),
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
});

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = WithdrawalDetailsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        // Use `upsert` to either create new details or update existing ones
        await prisma.withdrawalDetails.upsert({
            where: { userId: session.user.id },
            update: validation.data,
            create: {
                ...validation.data,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ message: "Withdrawal details saved successfully." });

    } catch (error) {
        console.error("WITHDRAWAL_DETAILS_ERROR:", error);
        return NextResponse.json({ error: 'Failed to save withdrawal details' }, { status: 500 });
    }
}