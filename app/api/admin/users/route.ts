/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/users/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { Prisma, Tier } from '@prisma/client';
import { User } from 'next-auth';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

// Validation schema for creating users - Fixed to handle string numbers
const CreateUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tier: z.enum(['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
  subscriptionMonths: z.union([
    z.number(),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) throw new Error("Must be a valid number");
      return num;
    })
  ]).pipe(z.number().min(0).max(120)),
  isVerified: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(true),
  sendWelcomeEmail: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false)
});

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const search = url.searchParams.get('search');
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fix tier type issue
    if (tier && Object.values(Tier).includes(tier as Tier)) {
      where.tier = tier as Tier;
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'verified':
          where.emailVerified = { not: null }; // Fix: use emailVerified instead of isVerified
          break;
        case 'unverified':
          where.emailVerified = null; // Fix: use emailVerified instead of isVerified
          break;
        case 'active':
          where.AND = [
            { subscriptionStartDate: { not: null } },
            { subscriptionExpiryDate: { gte: now } }
          ];
          break;
        case 'expired':
          where.subscriptionExpiryDate = { lt: now };
          break;
      }
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [users, totalCount, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          tier: true,
          emailVerified: true,
          subscriptionStartDate: true,
          subscriptionExpiryDate: true,
          createdAt: true,
          role: true,
          _count: {
            select: { referredUsers: true }
          }
        }
      }),
      prisma.user.count({ where }),
      // Stats for dashboard - Fix the aggregate type issue
      (async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const [totalUsers, verifiedUsers, activeSubscribers, totalCommissions, newUsersThisMonth] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { emailVerified: { not: null } } }), // Fix: direct count instead of aggregate
          prisma.user.count({
            where: {
              AND: [
                { subscriptionStartDate: { not: null } },
                { subscriptionExpiryDate: { gte: now } }
              ]
            }
          }),
          prisma.transaction.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
          }),
          prisma.user.count({
            where: { createdAt: { gte: startOfMonth } }
          })
        ]);

        return {
          totalUsers,
          verifiedUsers,
          activeSubscribers,
          totalCommissions: totalCommissions._sum.amount || 0,
          newUsersThisMonth
        };
      })()
    ]);

    // Add commission totals for each user
    const userIds = users.map(u => u.id);
    const commissionTotals = await prisma.transaction.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const usersWithCommissions = users.map(user => ({
      ...user,
      phoneNumber: user.phone, // Map phone to phoneNumber for frontend
      isVerified: !!user.emailVerified, // Convert to boolean
      totalCommissions: commissionTotals.find(c => c.userId === user.id)?._sum.amount || 0,
      directReferrals: user._count.referredUsers, 
      createdAt: user.createdAt.toISOString(),
      subscriptionStartDate: user.subscriptionStartDate?.toISOString() || null,
      subscriptionExpiryDate: user.subscriptionExpiryDate?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithCommissions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      },
      stats
    });

  } catch (error) {
    console.error('GET_USERS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
});

export const POST = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    console.log('Create user request:', JSON.stringify(body, null, 2));
    
    // Validate the input data
    const validatedData = CreateUserSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email.toLowerCase() }
        ]
      },
      select: { username: true, email: true }
    });

    if (existingUser) {
      if (existingUser.username === validatedData.username) {
        return NextResponse.json({
          success: false,
          error: 'Username already exists'
        }, { status: 400 });
      }
      if (existingUser.email === validatedData.email.toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: 'Email already exists'
        }, { status: 400 });
      }
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 12);

    // Calculate subscription dates if subscription months provided
    let subscriptionStartDate = null;
    let subscriptionExpiryDate = null;
    
    if (validatedData.subscriptionMonths > 0) {
      subscriptionStartDate = new Date();
      subscriptionExpiryDate = new Date();
      subscriptionExpiryDate.setMonth(subscriptionExpiryDate.getMonth() + validatedData.subscriptionMonths);
    }

    // Generate verification token if user is not pre-verified and welcome email is requested
    let verificationToken = null;
    let verificationTokenExpiry = null;
    
    if (!validatedData.isVerified && validatedData.sendWelcomeEmail) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        username: validatedData.username,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phoneNumber,
        password: hashedPassword,
        tier: validatedData.tier,
        emailVerified: validatedData.isVerified ? new Date() : null,
        subscriptionStartDate,
        subscriptionExpiryDate,
        role: 'USER', // Default role
        verificationToken,
        verificationTokenExpiry
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        tier: true,
        emailVerified: true,
        subscriptionStartDate: true,
        subscriptionExpiryDate: true,
        createdAt: true,
        role: true
      }
    });

    console.log('User created successfully:', newUser.id);

    // Send welcome/verification email if requested
    if (validatedData.sendWelcomeEmail) {
      try {
        if (!validatedData.isVerified && verificationToken) {
          // Send verification email for unverified users
          await sendVerificationEmail(newUser.email, verificationToken);
          console.log('Verification email sent to:', newUser.email);
        } else if (validatedData.isVerified) {
          // For pre-verified users, you might want to send a different welcome email
          // You'll need to implement sendWelcomeEmail function if you have one
          console.log('Welcome email for verified user - implement sendWelcomeEmail function');
          // await sendWelcomeEmail(newUser.email, newUser.fullName);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the user creation if email fails, just log it
      }
    }

    // Format response to match frontend expectations
    const responseUser = {
      ...newUser,
      phoneNumber: newUser.phone,
      isVerified: !!newUser.emailVerified,
      totalCommissions: 0, // New user has no commissions
      directReferrals: 0, // New user has no referrals
      createdAt: newUser.createdAt.toISOString(),
      subscriptionStartDate: newUser.subscriptionStartDate?.toISOString() || null,
      subscriptionExpiryDate: newUser.subscriptionExpiryDate?.toISOString() || null
    };

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: responseUser
    }, { status: 201 });

  } catch (error) {
    console.error('CREATE_USER_ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user data provided',
        details: error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'User ID and action are required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailVerified: true, tier: true, role: true, subscriptionExpiryDate: true, subscriptionStartDate: true, phone: true, fullName: true, email: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // eslint-disable-next-line prefer-const
    let updateData: Prisma.UserUpdateInput = {};

    switch (action) {
      case 'verify':
        updateData.emailVerified = new Date();
        break;
        
      case 'unverify':
        updateData.emailVerified = null;
        break;
        
      case 'update_tier':
        if (!data?.tier || !Object.values(Tier).includes(data.tier)) {
          return NextResponse.json({
            success: false,
            error: 'Valid tier is required'
          }, { status: 400 });
        }
        updateData.tier = data.tier;
        break;

      case 'update_profile':
        if (data?.fullName) updateData.fullName = data.fullName;
        if (data?.email) updateData.email = data.email.toLowerCase();
        if (data?.phoneNumber) updateData.phone = data.phoneNumber;
        break;
        
      case 'extend_subscription':
        if (!data?.months || typeof data.months !== 'number' || data.months <= 0) {
          return NextResponse.json({
            success: false,
            error: 'Valid number of months is required'
          }, { status: 400 });
        }
        
        const currentExpiry = user.subscriptionExpiryDate || new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + data.months);
        
        updateData.subscriptionExpiryDate = newExpiry;
        if (!user.subscriptionStartDate) {
          updateData.subscriptionStartDate = new Date();
        }
        break;
        
      case 'revoke_subscription':
        updateData.subscriptionExpiryDate = new Date(); // Set to current date to expire immediately
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        tier: true,
        emailVerified: true,
        subscriptionStartDate: true,
        subscriptionExpiryDate: true,
        createdAt: true,
        role: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${action.replace('_', ' ')} successful`,
      user: {
        ...updatedUser,
        phoneNumber: updatedUser.phone,
        isVerified: !!updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        subscriptionStartDate: updatedUser.subscriptionStartDate?.toISOString() || null,
        subscriptionExpiryDate: updatedUser.subscriptionExpiryDate?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('UPDATE_USER_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
});