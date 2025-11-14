// AFFILIATE PROJECT - app/api/public/validate-creator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Validate creator code from grocery store
 * POST /api/public/validate-creator
 */
export async function POST(request: NextRequest) {
  try {
    // ======================================================================
    // SECURITY: Verify API Key from Grocery Store
    // ======================================================================
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.GROCERY_API_KEY

    if (!expectedApiKey) {
      console.error('GROCERY_API_KEY not configured in environment')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (apiKey !== expectedApiKey) {
      console.warn('Invalid API key attempt from:', request.headers.get('x-forwarded-for') || 'unknown')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { code } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    // Validate code format (letters followed by 4 digits)
    if (!/^[A-Za-z_]+\d{4}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Extract username from code (remove year suffix)
    const username = code.replace(/\d{4}$/, '').toLowerCase()

    // Find creator in affiliate database
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
        whatsappNumber: true,
      },
    })

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        fullName: creator.fullName || 'Unknown Creator',
        username: creator.username || username,
        instagramHandle: creator.instagramHandle,
        tiktokHandle: creator.tiktokHandle,
      },
      commissionRate: 0.05, // 5% for creators
    })
  } catch (error) {
    console.error('VALIDATE_CREATOR_ERROR:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


// ============================================================================
