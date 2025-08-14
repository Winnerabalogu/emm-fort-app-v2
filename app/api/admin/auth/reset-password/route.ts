// app/api/admin/auth/reset-password/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { clearUserCache } from '@/auth';

const AdminResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(12, 'Admin password must be at least 12 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = AdminResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.issues[0].message || 'Invalid input data'
      }, { status: 400 });
    }

    const { token, password } = validation.data;

    // Find admin user with valid reset token
    const admin = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        },
        role: 'ADMIN' // Ensure only admin accounts can be reset through this endpoint
      }
    });

    if (!admin) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token. Please request a new admin password reset.' 
      }, { status: 400 });
    }

    // Hash new password with higher rounds for admin accounts
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update admin password and clear reset token
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Clear user cache
    clearUserCache(admin.id);

    console.log(`Admin password reset successful for: ${admin.email}`);

    return NextResponse.json({ 
      message: 'Admin password reset successful. You can now login with your new password.' 
    }, { status: 200 });

  } catch (error) {
    console.error('ADMIN_RESET_PASSWORD_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}