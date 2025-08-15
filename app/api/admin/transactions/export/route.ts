/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/transactions/export/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { User } from 'next-auth';

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const where: Prisma.TransactionWhereInput = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    
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
          toDate.setHours(23, 59, 59, 999);
          where.createdAt.lte = toDate;
        }
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
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
    });

    // Generate CSV content
    const csvHeaders = [
      'Transaction ID',
      'Type',
      'Amount',
      'Status',
      'User Name',
      'User Email',
      'User Tier',
      'Source User',
      'Source User Tier',
      'Created At'
    ].join(',');

    const csvRows = transactions.map(transaction => [
      transaction.id,
      transaction.type,
      transaction.amount.toString(),
      transaction.status,
      `"${transaction.user.fullName}"`,
      transaction.user.email,
      transaction.user.tier,
      transaction.sourceUser ? `"${transaction.sourceUser.fullName}"` : '',
      transaction.sourceUser ? transaction.sourceUser.tier : '',
      new Date(transaction.createdAt).toISOString()
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('EXPORT_TRANSACTIONS_ERROR:', error);
    throw new Error('Failed to export transactions');
  }
});