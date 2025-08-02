
// app/api/auth/verify/route.ts
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token provided.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 404 });
    }

    if (!user.verificationTokenExpiry || new Date() > user.verificationTokenExpiry) {
      return NextResponse.json({ error: 'Token has expired.' }, { status: 410 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({ 
      message: 'Email verified successfully.',
      email: updatedUser.email 
    }, { status: 200 });

  } catch (error) {
    console.error('VERIFICATION API ERROR:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}