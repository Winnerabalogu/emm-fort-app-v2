// app/api/admin/transactions/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { processCommissions } from '@/lib/commissionService';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
const ManualTransactionSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['COMMISSION', 'BONUS', 'SALE_COMMISSION', 'MANUAL_ADJUSTMENT']),
  amount: z.number().positive(),
  sourceUserId: z.string().uuid().optional(),
  triggerCommissions: z.boolean().default(false),
});

const UpdateTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
});

export const GET = withAdmin(async (req) => {
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
    throw new Error('Failed to fetch transactions');
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withAdmin(async (req, admin) => {
  try {
    const body = await req.json();
    const validatedData = ManualTransactionSchema.parse(body);

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
      throw new Error('Target user not found');
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
        throw new Error('Source user not found');
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

    if (validatedData.triggerCommissions && 
        validatedData.sourceUserId && 
        ['SALE_COMMISSION', 'COMMISSION'].includes(validatedData.type)) {
      
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
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw error; // Will be handled by withAdmin wrapper
    }
    
    throw new Error('Failed to create manual transaction');
  }
});

export const PATCH = withAdmin(async (req) => {
  try {
    const body = await req.json();
    const validatedData = UpdateTransactionSchema.parse(body);

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: validatedData.transactionId },
      select: { id: true, status: true, type: true }
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found');
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

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: updatedTransaction }
    });

  } catch (error) {
    console.error('UPDATE_TRANSACTION_ERROR:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw error; // Will be handled by withAdmin wrapper
    }
    
    throw new Error('Failed to update transaction');
  }
});