// app/api/auth/reset-password/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { clearUserCache } from '@/auth';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { token, password } = validation.data;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Clear user cache
    clearUserCache(user.id);

    console.log(`Password reset successful for user: ${user.email}`);

    return NextResponse.json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    }, { status: 200 });

  } catch (error) {
    console.error('RESET_PASSWORD_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}