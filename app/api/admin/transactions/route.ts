/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/transactions/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { processCommissions } from '@/lib/commissionService';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { User } from 'next-auth';

// More flexible schema that accepts both UUIDs and other string formats
const ManualTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(['COMMISSION', 'BONUS', 'SALE_COMMISSION', 'MANUAL_ADJUSTMENT']),
  amount: z.number().positive("Amount must be positive"),
  sourceUserId: z.string().min(1).optional(),
  triggerCommissions: z.boolean().default(false),
});

const UpdateTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
});

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const userId = url.searchParams.get('userId');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) where.userId = userId;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          where.createdAt.gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          // Set to end of day
          toDate.setHours(23, 59, 59, 999);
          where.createdAt.lte = toDate;
        }
      }
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              tier: true
            }
          },
          sourceUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
              tier: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const summary = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _count: true
    });

    const statusSummary = await prisma.transaction.groupBy({
      by: ['status'],
      where,
      _sum: { amount: true },
      _count: true
    });

    const transactionStats = {
      totalCount,
      totalAmount: summary._sum.amount || 0,
      byStatus: statusSummary.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count,
          amount: item._sum.amount || 0
        };
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        summary: transactionStats
      }
    });

  } catch (error) {
    console.error('GET_TRANSACTIONS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
});

export const POST = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    console.log('Transaction creation request:', JSON.stringify(body, null, 2));
    
    const validatedData = ManualTransactionSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { 
        id: true, 
        fullName: true, 
        tier: true,
        email: true 
      }
    });

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'Target user not found'
      }, { status: 404 });
    }

    // Verify source user if provided
    let sourceUser = null;
    if (validatedData.sourceUserId) {
      sourceUser = await prisma.user.findUnique({
        where: { id: validatedData.sourceUserId },
        select: { 
          id: true, 
          fullName: true, 
          tier: true,
          email: true 
        }
      });
      
      if (!sourceUser) {
        return NextResponse.json({
          success: false,
          error: 'Source user not found'
        }, { status: 404 });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        status: 'COMPLETED',
        userId: validatedData.userId,
        sourceUserId: validatedData.sourceUserId,
      },
      include: {
        user: {
          select: { 
            id: true,
            fullName: true, 
            username: true, 
            tier: true,
            email: true 
          }
        },
        sourceUser: {
          select: { 
            id: true,
            fullName: true, 
            username: true, 
            tier: true 
          }
        }
      }
    });

    console.log('Transaction created:', transaction.id);

    // Process commissions if requested
    if (validatedData.triggerCommissions && 
        validatedData.sourceUserId && 
        ['SALE_COMMISSION', 'COMMISSION'].includes(validatedData.type)) {
      
      console.log('Triggering commission processing...');
      processCommissions(validatedData.sourceUserId, validatedData.amount)
        .then(() => {
          console.log(`Commissions processed for manual transaction: ${transaction.id}`);
        })
        .catch((commissionError) => {
          console.error('Commission processing failed for manual transaction:', {
            transactionId: transaction.id,
            error: commissionError
          });
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Manual transaction created successfully',
      data: { transaction }
    }, { status: 201 });

  } catch (error) {
    console.error('CREATE_TRANSACTION_ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid transaction data provided',
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
      error: 'Failed to create manual transaction'
    }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    console.log('Transaction update request:', JSON.stringify(body, null, 2));
    
    const validatedData = UpdateTransactionSchema.parse(body);

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: validatedData.transactionId },
      select: { id: true, status: true, type: true }
    });

    if (!existingTransaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    const updateData: Partial<Prisma.TransactionUpdateInput> = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: validatedData.transactionId },
      data: updateData,
      include: {
        user: {
          select: { 
            id: true,
            fullName: true, 
            username: true,
            email: true 
          }
        },
        sourceUser: {
          select: { 
            id: true,
            fullName: true, 
            username: true 
          }
        }
      }
    });

    console.log('Transaction updated:', updatedTransaction.id);

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: updatedTransaction }
    });

  } catch (error) {
    console.error('UPDATE_TRANSACTION_ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid update data provided',
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
      error: 'Failed to update transaction'
    }, { status: 500 });
  }
});