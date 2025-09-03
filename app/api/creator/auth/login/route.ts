// app/api/creator/auth/login/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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
        details: validationResult.error
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // Find creator user
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        isCreator: true // Only allow creator accounts
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        password: true,
        emailVerified: true,
        isCreator: true,
        instagramHandle: true,
        tiktokHandle: true,
        contentStyle: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid credentials or creator account not found' 
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

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      isCreator: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        isCreator: user.isCreator,
        instagramHandle: user.instagramHandle,
        tiktokHandle: user.tiktokHandle,
        contentStyle: user.contentStyle,
        createdAt: user.createdAt.toISOString()
      },
      redirectTo: '/creator/dashboard'
    }, { status: 200 });

    // Set HTTP-only cookie
    response.cookies.set('creator-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('CREATOR_LOGIN_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during login' 
    }, { status: 500 });
  }
}