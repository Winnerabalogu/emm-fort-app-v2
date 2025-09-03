// app/api/email-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().min(1, 'Source is required'),
  metadata: z.record(z.string(), z.any()).optional()

});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, metadata } = subscriptionSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.emailSubscription.findUnique({
      where: { email }
    });

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        // Reactivate subscription
        await prisma.emailSubscription.update({
          where: { email },
          data: {
            status: 'ACTIVE',
            source,
            metadata,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed! We\'ll keep you updated.'
        });
      }
    }

    // Create new subscription
    await prisma.emailSubscription.create({
      data: {
        email,
        source,
        metadata,
        status: 'ACTIVE'
      }
    });

    // Send welcome email
    try {
      const { sendEmailSubscriptionConfirmation } = await import('@/lib/email');
      await sendEmailSubscriptionConfirmation(email, source);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the API call if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Email subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input', 
          details: error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to subscribe. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Unsubscribe endpoint
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Simple token validation (in production, use proper signed tokens)
    const expectedToken = Buffer.from(email).toString('base64');
    if (token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    await prisma.emailSubscription.update({
      where: { email },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed.'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}