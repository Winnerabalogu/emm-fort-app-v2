// app/api/contact/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.string().default('contact_form')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Create contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        ...validatedData,
        status: 'NEW',
        priority: 'NORMAL'
      }
    });

    // Send notification emails
    try {
      const { sendNewContactRequestEmail, sendContactConfirmationEmail } = await import('@/lib/email');
      
      // Send notification to admin
      await sendNewContactRequestEmail(contactRequest);
      
      // Send confirmation to user
      await sendContactConfirmationEmail(validatedData.email, validatedData.fullName, validatedData.subject);
      
    } catch (emailError) {
      console.error('Failed to send contact emails:', emailError);
      // Don't fail the API call if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      contactId: contactRequest.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
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
        error: 'Failed to send message. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // This could be used by admin to fetch contact requests
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get contact requests error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact requests' },
      { status: 500 }
    );
  }
}