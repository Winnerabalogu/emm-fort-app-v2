// ============================================================================
// AFFILIATE PROJECT - app/api/public/track-commission/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Track commission from grocery order
 * POST /api/public/track-commission
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

    const {
      orderId,
      orderNumber,
      orderTotal,
      affiliateCode,
      customerEmail,
      timestamp,
      source,
    } = body

    // Validate required fields
    if (!orderId || !orderTotal || !affiliateCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ======================================================================
    // DUPLICATE PREVENTION: Check if commission already exists
    // ======================================================================
    const existingCommission = await prisma.transaction.findFirst({
      where: {
        type: 'COMMISSION',
        referralOrderId: orderId,
      },
    })

    if (existingCommission) {
      console.warn('Duplicate commission attempt for order:', orderId)
      return NextResponse.json(
        {
          success: false,
          error: 'Commission already tracked for this order',
          existingCommissionId: existingCommission.id
        },
        { status: 409 } // 409 Conflict
      )
    }

    // Extract username from code
    const username = affiliateCode.replace(/\d{4}$/, '').toLowerCase()

    // Find creator
    const creator = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
        isCreator: true,
        emailVerified: { not: null },
      },
    })

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // Calculate commission (5%)
    const commissionAmount = orderTotal * 0.05

    // Validate commission amount is reasonable (max ₦50,000 per order)
    if (commissionAmount > 50000) {
      console.warn('Unusually high commission amount:', { orderId, amount: commissionAmount })
    }

    // Create commission transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: 'COMMISSION',
        amount: commissionAmount,
        status: 'COMPLETED',
        userId: creator.id,
        referralOrderId: orderId,
        sourceUserId: null, // ← CRITICAL: No sourceUserId = creator commission
        description: `Creator commission from grocery order #${orderNumber || orderId.slice(-8)}`,
      },
    })

    // Optionally create a content post tracking entry
    // This links the earning to potential content the creator made
    await prisma.contentPost.updateMany({
      where: {
        userId: creator.id,
        status: 'PUBLISHED',
      },
      data: {
        earnings: {
          increment: commissionAmount,
        },
      },
    })

    console.log('Commission tracked:', {
      creatorId: creator.id,
      orderId,
      amount: commissionAmount,
      transactionId: transaction.id,
    })

    return NextResponse.json({
      success: true,
      commission: {
        id: transaction.id,
        amount: commissionAmount,
        creatorId: creator.id,
        creatorName: creator.fullName,
      },
    })
  } catch (error) {
    console.error('TRACK_COMMISSION_ERROR:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track commission' },
      { status: 500 }
    )
  }
}
