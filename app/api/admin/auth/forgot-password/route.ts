// app/api/admin/auth/forgot-password/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendAdminPasswordResetEmail } from '@/lib/email';

const AdminForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = AdminForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    const { email } = validation.data;

    // Check if admin user exists
    const admin = await prisma.user.findFirst({
      where: { 
        email: { equals: email, mode: 'insensitive' },
        role: 'ADMIN' // Only admins can reset through this endpoint
      }
    });

    // Always return success to prevent email enumeration attacks
    if (!admin) {
      console.log(`Admin password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ 
        message: 'If an admin account with this email exists, we\'ve sent a password reset link.' 
      }, { status: 200 });
    }

    // Check if email is verified
    if (!admin.emailVerified) {
      return NextResponse.json({ 
        error: 'Admin email address must be verified before requesting a password reset.' 
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send admin password reset email (you might want to create a special admin template)
    await sendAdminPasswordResetEmail(admin.email, resetToken); // true flag for admin email

    console.log(`Admin password reset email sent to: ${admin.email}`);

    return NextResponse.json({ 
      message: 'If an admin account with this email exists, we\'ve sent a password reset link.' 
    }, { status: 200 });

  } catch (error) {
    console.error('ADMIN_FORGOT_PASSWORD_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}