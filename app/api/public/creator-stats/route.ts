// AFFILIATE PROJECT - app/api/public/creator-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get creator statistics for public display
 * GET /api/public/creator-stats?username=master_upliner
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    const creator = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
        isCreator: true,
        emailVerified: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        instagramHandle: true,
        tiktokHandle: true,
        contentStyle: true,
        followersCount: true,
      },
    })

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // Get earnings stats
    const earnings = await prisma.transaction.aggregate({
      where: {
        userId: creator.id,
        type: 'COMMISSION',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    })

    // Get content posts count
    const contentCount = await prisma.contentPost.count({
      where: {
        userId: creator.id,
        status: 'PUBLISHED',
      },
    })

    return NextResponse.json({
      success: true,
      creator: {
        fullName: creator.fullName,
        username: creator.username,
        instagramHandle: creator.instagramHandle,
        tiktokHandle: creator.tiktokHandle,
        contentStyle: creator.contentStyle,
        followersCount: creator.followersCount,
      },
      stats: {
        totalEarnings: earnings._sum.amount || 0,
        totalOrders: earnings._count,
        contentPosts: contentCount,
      },
    })
  } catch (error) {
    console.error('CREATOR_STATS_ERROR:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creator stats' },
      { status: 500 }
    )
  }
}