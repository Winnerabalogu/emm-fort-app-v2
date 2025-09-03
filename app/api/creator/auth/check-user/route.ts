// app/api/creator/auth/check-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CheckUserSchema = z.object({
  email: z.string().email('Invalid email address')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = CheckUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid email format',
        details: validationResult.error
      }, { status: 400 });
    }

    const { email } = validationResult.data;

    // Find creator user
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        isCreator: true // Only allow creator accounts
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isCreator: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Creator account not found. Please register as a creator first.' 
      }, { status: 404 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      }, { status: 403 });
    }

    // User exists and is verified
    return NextResponse.json({
      message: 'Creator account verified',
      isCreator: true
    }, { status: 200 });

  } catch (error) {
    console.error('CHECK_USER_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during validation' 
    }, { status: 500 });
  }
}