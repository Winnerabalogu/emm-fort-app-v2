/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/withdrawals/[id]/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { User } from 'next-auth';
import { z } from 'zod';

// Updated schema to match frontend request format
const WithdrawalUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  reason: z.string().optional(), 
  adminNote: z.string().optional()
});

export const PATCH = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const body = await req.json();
    
    console.log('Processing withdrawal request:', id, 'Body:', body);
    
    const validation = WithdrawalUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    const { status, reason} = validation.data;

    // Find the withdrawal request first
    const existingWithdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            tier: true
          }
        }
      }
    });

    if (!existingWithdrawal) {
      return NextResponse.json({
        success: false,
        error: 'Withdrawal request not found'
      }, { status: 404 });
    }

    // Check if withdrawal is already processed (unless resetting to PENDING)
    if (existingWithdrawal.status !== 'PENDING' && status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: `Withdrawal request is already ${existingWithdrawal.status.toLowerCase()}`
      }, { status: 400 });
    }

    // Prepare update data based on status - only use fields that exist in your schema
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    let transactionData: any = null;

    switch (status) {
      case 'APPROVED':
        // Create a transaction record for the approved withdrawal
        transactionData = {
          userId: existingWithdrawal.userId,
          amount: -existingWithdrawal.amount, // Negative for withdrawal
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          description: `Withdrawal approved - Amount: ₦${existingWithdrawal.amount.toLocaleString()}`
        };
        break;

      case 'REJECTED':
        if (!reason || !reason.trim()) {
          return NextResponse.json({
            success: false,
            error: 'Rejection reason is required when rejecting a withdrawal'
          }, { status: 400 });
        }
        // Note: rejectionReason field doesn't exist in your schema
        // You might need to add this field or handle rejection differently
        break;

      case 'PENDING':
        // Reset to pending
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid status'
        }, { status: 400 });
    }

    // Execute the update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the withdrawal request
      const updatedWithdrawal = await tx.withdrawalRequest.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              tier: true
            }
          }
        }
      });

      // Create transaction record if needed (for approved withdrawals)
      if (transactionData) {
        await tx.transaction.create({
          data: transactionData
        });
      }

      return updatedWithdrawal;
    });

    console.log(`Withdrawal ${status.toLowerCase()} successfully:`, id);

    return NextResponse.json({
      success: true,
      message: `Withdrawal request ${status.toLowerCase()} successfully`,
      data: {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('PROCESS_WITHDRAWAL_ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
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
      error: 'Failed to process withdrawal request'
    }, { status: 500 });
  }
});

// Optional: GET endpoint for individual withdrawal details
export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            tier: true,
            withdrawalDetails: true
          }
        }
      }
    });

    if (!withdrawal) {
      return NextResponse.json({
        success: false,
        error: 'Withdrawal request not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...withdrawal,
        createdAt: withdrawal.createdAt.toISOString(),
        updatedAt: withdrawal.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('GET_WITHDRAWAL_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch withdrawal request'
    }, { status: 500 });
  }
});