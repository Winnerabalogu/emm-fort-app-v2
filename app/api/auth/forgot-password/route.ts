// app/api/auth/forgot-password/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { 
        email: { equals: email, mode: 'insensitive' }
      }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ 
        message: 'If an account with this email exists, we\'ve sent a password reset link.' 
      }, { status: 200 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email address before requesting a password reset.' 
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    console.log(`Password reset email sent to: ${user.email}`);

    return NextResponse.json({ 
      message: 'If an account with this email exists, we\'ve sent a password reset link.' 
    }, { status: 200 });

  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}