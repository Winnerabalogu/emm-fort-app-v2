// app/api/creator/auth/verify/route.ts
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token provided.' }, { status: 400 });
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { 
        verificationToken: token,
        isCreator: true // Ensure this is a creator account
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        verificationTokenExpiry: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid verification token or creator account not found.' 
      }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: 'Email already verified. You can now log in.',
        email: user.email 
      }, { status: 200 });
    }

    if (!user.verificationTokenExpiry || new Date() > user.verificationTokenExpiry) {
      return NextResponse.json({ 
        error: 'Verification token has expired. Please request a new one.' 
      }, { status: 410 });
    }

    // Update user to mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
      select: {
        email: true,
        fullName: true
      }
    });

    return NextResponse.json({ 
      message: 'Creator account verified successfully! You can now log in.',
      email: updatedUser.email,
      name: updatedUser.fullName
    }, { status: 200 });

  } catch (error) {
    console.error('CREATOR_VERIFICATION_API_ERROR:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during verification.' 
    }, { status: 500 });
  }
}