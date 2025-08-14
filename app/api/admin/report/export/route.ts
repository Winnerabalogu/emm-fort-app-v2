// app/api/admin/reports/export/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';

// Define proper types for CSV data
interface CSVRow {
  [key: string]: string | number | boolean | null;
}

// Helper function to generate CSV content with proper typing
function generateCSV(data: CSVRow[], headers: string[]): string {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      
      const stringValue = String(value);
      // Escape commas and quotes in CSV
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export const GET = withAdmin(async (req) => {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const type = url.searchParams.get('type') || 'overview';
    const format = url.searchParams.get('format') || 'csv';

    // Parse date range
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            tier: true,
            role: true,
            createdAt: true,
            subscriptionStartDate: true,
            subscriptionExpiryDate: true,
            transactions: {
              where: { status: 'COMPLETED' },
              select: { amount: true }
            }
          }
        });

        const userExportData: CSVRow[] = users.map(user => ({
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          tier: user.tier,
          role: user.role,
          createdAt: user.createdAt.toISOString().split('T')[0],
          subscriptionStart: user.subscriptionStartDate ? user.subscriptionStartDate.toISOString().split('T')[0] : '',
          subscriptionExpiry: user.subscriptionExpiryDate ? user.subscriptionExpiryDate.toISOString().split('T')[0] : '',
          totalEarnings: formatCurrency(user.transactions.reduce((sum, t) => sum + t.amount, 0))
        }));

        csvContent = generateCSV(userExportData, [
          'id', 'fullName', 'username', 'email', 'tier', 'role', 
          'createdAt', 'subscriptionStart', 'subscriptionExpiry', 'totalEarnings'
        ]);
        filename = `users-report-${fromDate.toISOString().split('T')[0]}-to-${toDate.toISOString().split('T')[0]}`;
        break;

      case 'transactions':
        const transactions = await prisma.transaction.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            description: true,
            createdAt: true,
            user: {
              select: {
                fullName: true,
                username: true,
                email: true
              }
            },
            sourceUser: {
              select: {
                fullName: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        const transactionExportData: CSVRow[] = transactions.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: formatCurrency(transaction.amount),
          status: transaction.status,
          description: transaction.description || '',
          createdAt: transaction.createdAt.toISOString(),
          userFullName: transaction.user.fullName,
          userName: transaction.user.username,
          userEmail: transaction.user.email,
          sourceUserName: transaction.sourceUser?.fullName || '',
          sourceUserUsername: transaction.sourceUser?.username || ''
        }));

        csvContent = generateCSV(transactionExportData, [
          'id', 'type', 'amount', 'status', 'description', 'createdAt',
          'userFullName', 'userName', 'userEmail', 'sourceUserName', 'sourceUserUsername'
        ]);
        filename = `transactions-report-${fromDate.toISOString().split('T')[0]}-to-${toDate.toISOString().split('T')[0]}`;
        break;

      case 'financial':
        // Get commission data per user instead of problematic groupBy
        const commissionUsers = await prisma.user.findMany({
          where: {
            transactions: {
              some: {
                status: 'COMPLETED',
                type: 'COMMISSION',
                createdAt: { gte: fromDate, lte: toDate }
              }
            }
          },
          select: {
            fullName: true,
            username: true,
            tier: true,
            transactions: {
              where: {
                status: 'COMPLETED',
                type: { in: ['COMMISSION', 'BONUS'] },
                createdAt: { gte: fromDate, lte: toDate }
              },
              select: { amount: true }
            }
          }
        });

        const financialData: CSVRow[] = commissionUsers
          .map(user => {
            const totalEarnings = user.transactions.reduce((sum, t) => sum + t.amount, 0);
            return {
              fullName: user.fullName,
              username: user.username,
              tier: user.tier,
              totalEarnings: formatCurrency(totalEarnings),
              transactionCount: user.transactions.length
            };
          })
          .sort((a, b) => {
            const aAmount = parseFloat(String(a.totalEarnings).replace(/[₦,]/g, ''));
            const bAmount = parseFloat(String(b.totalEarnings).replace(/[₦,]/g, ''));
            return bAmount - aAmount;
          });

        csvContent = generateCSV(financialData, ['fullName', 'username', 'tier', 'totalEarnings', 'transactionCount']);
        filename = `financial-report-${fromDate.toISOString().split('T')[0]}-to-${toDate.toISOString().split('T')[0]}`;
        break;

      case 'overview':
      default:
        // Generate overview report
        const [userCount, transactionCount, revenueSum] = await Promise.all([
          prisma.user.count({
            where: { 
              createdAt: { gte: fromDate, lte: toDate },
              role: 'USER' 
            }
          }),
          prisma.transaction.count({
            where: { createdAt: { gte: fromDate, lte: toDate } }
          }),
          prisma.transaction.aggregate({
            where: {
              status: 'COMPLETED',
              type: { in: ['COMMISSION', 'BONUS', 'SALE_COMMISSION'] },
              createdAt: { gte: fromDate, lte: toDate }
            },
            _sum: { amount: true }
          })
        ]);

        const overviewData: CSVRow[] = [{
          metric: 'Total Users',
          value: userCount,
          period: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`
        }, {
          metric: 'Total Transactions',
          value: transactionCount,
          period: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`
        }, {
          metric: 'Total Revenue',
          value: formatCurrency(revenueSum._sum.amount || 0),
          period: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`
        }];

        csvContent = generateCSV(overviewData, ['metric', 'value', 'period']);
        filename = `overview-report-${fromDate.toISOString().split('T')[0]}-to-${toDate.toISOString().split('T')[0]}`;
        break;
    }

    if (format === 'pdf') {
      return NextResponse.json({
        success: false,
        error: 'PDF export not implemented yet'
      }, { status: 501 });
    }

    // Return CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.${format}"`,
      },
    });

    return response;

  } catch (error) {
    console.error('EXPORT_REPORTS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export report'
    }, { status: 500 });
  }
});