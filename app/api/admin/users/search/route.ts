export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: { users: [] } });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        tier: true,
        subscriptionStartDate: true
      },
      take: limit,
      orderBy: { fullName: 'asc' }
    });

    return NextResponse.json({ success: true, data: { users } });
  } catch (error) {
    console.error('ADMIN_USER_SEARCH_ERROR:', error);
    throw new Error('Failed to search users');
  }
});