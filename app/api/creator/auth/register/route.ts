// app/api/creator/auth/register/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

// Validation schema for creator registration
const CreatorRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  whatsappNumber: z.string().min(10, 'WhatsApp number is required'),
  contentStyle: z.string().min(1, 'Content style is required'),
  followersCount: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = CreatorRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error
      }, { status: 400 });
    }

    const {
      fullName,
      email,
      phone,
      password,
      instagramHandle,
      tiktokHandle,
      whatsappNumber,
      contentStyle,
      followersCount
    } = validationResult.data;

    // Generate username from email or name
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    
    // Ensure username is unique
    while (true) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!existingUser) break;
      
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Check if user already exists (email should be unique)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'An account with this email already exists' 
      }, { status: 409 });
    }

    // Validate social media handles (at least one required)
    if (!instagramHandle && !tiktokHandle) {
      return NextResponse.json({
        error: 'Please provide at least one social media handle (Instagram or TikTok)'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Create creator user
    const creatorUser = await prisma.user.create({
      data: {
        fullName,
        username,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
        // Creator-specific fields
        isCreator: true,
        instagramHandle: instagramHandle || null,
        tiktokHandle: tiktokHandle || null,
        whatsappNumber,
        contentStyle,
        followersCount: followersCount || null,
        // Default values for regular user fields
        tier: 'BASIC', // Creators don't use tiers but field is required
        role: 'USER'
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        isCreator: true,
        instagramHandle: true,
        tiktokHandle: true,
        contentStyle: true,
        createdAt: true
      }
    });

    // Send verification email
    await sendVerificationEmail(creatorUser.email, verificationToken);

    return NextResponse.json({
      message: 'Creator account created successfully. Please check your email to verify your account.',
      user: {
        ...creatorUser,
        createdAt: creatorUser.createdAt.toISOString()
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('CREATOR_REGISTRATION_ERROR:', error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'Username or email already exists' 
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      error: 'An unexpected error occurred during registration' 
    }, { status: 500 });
  }
}