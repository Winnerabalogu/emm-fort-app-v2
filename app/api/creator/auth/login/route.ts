// app/api/creator/auth/login/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signIn } from '@/auth';

// Validation schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // Find creator user
    const user = await prisma.user.findFirst({
      where: { 
        email: { equals: email.toLowerCase(), mode: 'insensitive' },
        isCreator: true // Only allow creator accounts
      },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        isCreator: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid credentials or not a creator account' 
      }, { status: 401 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      }, { status: 403 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Use NextAuth signIn - this will create the proper session
    try {
      await signIn('credentials', {
        email: email.toLowerCase(),
        password: password,
        redirect: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        redirectTo: '/creator/dashboard'
      }, { status: 200 });

    } catch (signInError) {
      console.error('NextAuth signIn error:', signInError);
      return NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 401 });
    }

  } catch (error) {
    console.error('CREATOR_LOGIN_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during login' 
    }, { status: 500 });
  }
}