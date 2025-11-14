/**
 * GROCERY COMMISSION SERVICE
 *
 * Shared module for tracking grocery store commissions.
 *
 * USAGE IN GROCERY STORE APP:
 * 1. Copy this file to grocery store app: `lib/groceryCommission.ts`
 * 2. Ensure DATABASE_URL points to same database
 * 3. Import and use functions directly
 *
 * Benefits:
 * - Faster (no HTTP overhead)
 * - Consistent (same code in both apps)
 * - Transactional (database ACID guarantees)
 * - Type-safe (TypeScript interfaces)
 */

import { prisma } from './prisma'

// ============================================================================
// TYPES
// ============================================================================

export interface ValidateCreatorCodeResult {
  success: true
  creator: {
    id: string
    fullName: string
    username: string
    instagramHandle: string | null
    tiktokHandle: string | null
  }
  commissionRate: number
}

export interface ValidateCreatorCodeError {
  success: false
  error: string
}

export interface TrackCommissionResult {
  success: true
  commission: {
    id: string
    amount: number
    creatorId: string
    creatorName: string
  }
}

export interface TrackCommissionError {
  success: false
  error: string
  existingCommissionId?: string
}

export interface CreatorCommissionInput {
  orderId: string
  orderNumber?: string
  orderTotal: number
  affiliateCode: string
  customerEmail?: string
  timestamp?: Date
  source?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CREATOR_COMMISSION_RATE = 0.05 // 5%
const MAX_COMMISSION_AMOUNT = 50000 // ₦50,000 warning threshold

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates a creator code and returns creator information
 *
 * @param code - Creator code (e.g., "MASTER2024")
 * @returns Creator details and commission rate, or error
 *
 * @example
 * ```typescript
 * const result = await validateCreatorCode("MASTER2024")
 * if (result.success) {
 *   console.log(`Creator: ${result.creator.fullName}`)
 *   console.log(`Commission rate: ${result.commissionRate * 100}%`)
 * }
 * ```
 */
export async function validateCreatorCode(
  code: string
): Promise<ValidateCreatorCodeResult | ValidateCreatorCodeError> {
  try {
    // Validate input
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Code is required and must be a string',
      }
    }

    // Validate format (letters/underscore followed by 4 digits)
    if (!/^[A-Za-z_]+\d{4}$/.test(code)) {
      return {
        success: false,
        error: 'Invalid code format. Expected format: LETTERS2024',
      }
    }

    // Extract username (remove year suffix)
    const username = code.replace(/\d{4}$/, '').toLowerCase()

    // Find creator in database
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
      },
    })

    if (!creator) {
      return {
        success: false,
        error: 'Creator not found or not verified',
      }
    }

    return {
      success: true,
      creator: {
        id: creator.id,
        fullName: creator.fullName || 'Unknown Creator',
        username: creator.username || username,
        instagramHandle: creator.instagramHandle,
        tiktokHandle: creator.tiktokHandle,
      },
      commissionRate: CREATOR_COMMISSION_RATE,
    }
  } catch (error) {
    console.error('VALIDATE_CREATOR_CODE_ERROR:', error)
    return {
      success: false,
      error: 'Failed to validate creator code',
    }
  }
}

// ============================================================================
// COMMISSION TRACKING
// ============================================================================

/**
 * Tracks commission for a grocery order
 *
 * Features:
 * - Automatic duplicate prevention
 * - Validates creator existence
 * - Calculates commission (5%)
 * - Creates transaction record
 * - Updates content post earnings
 *
 * @param input - Order and commission details
 * @returns Commission details or error
 *
 * @example
 * ```typescript
 * const result = await trackGroceryCommission({
 *   orderId: "grocery_order_123",
 *   orderNumber: "EMM-2024-001",
 *   orderTotal: 50000,
 *   affiliateCode: "MASTER2024"
 * })
 *
 * if (result.success) {
 *   console.log(`Commission: ₦${result.commission.amount}`)
 * }
 * ```
 */
export async function trackGroceryCommission(
  input: CreatorCommissionInput
): Promise<TrackCommissionResult | TrackCommissionError> {
  try {
    const {
      orderId,
      orderNumber,
      orderTotal,
      affiliateCode,
    } = input

    // ========================================================================
    // 1. VALIDATE INPUTS
    // ========================================================================
    if (!orderId || !orderTotal || !affiliateCode) {
      return {
        success: false,
        error: 'Missing required fields: orderId, orderTotal, or affiliateCode',
      }
    }

    if (typeof orderTotal !== 'number' || orderTotal <= 0) {
      return {
        success: false,
        error: 'Order total must be a positive number',
      }
    }

    // ========================================================================
    // 2. DUPLICATE PREVENTION
    // ========================================================================
    const existingCommission = await prisma.transaction.findFirst({
      where: {
        type: 'COMMISSION',
        referralOrderId: orderId,
      },
      select: {
        id: true,
      },
    })

    if (existingCommission) {
      console.warn('DUPLICATE_COMMISSION_ATTEMPT:', {
        orderId,
        existingCommissionId: existingCommission.id,
      })

      return {
        success: false,
        error: 'Commission already tracked for this order',
        existingCommissionId: existingCommission.id,
      }
    }

    // ========================================================================
    // 3. VALIDATE CREATOR
    // ========================================================================
    const username = affiliateCode.replace(/\d{4}$/, '').toLowerCase()

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
      },
    })

    if (!creator) {
      return {
        success: false,
        error: 'Creator not found or not verified',
      }
    }

    // ========================================================================
    // 4. CALCULATE COMMISSION
    // ========================================================================
    const commissionAmount = orderTotal * CREATOR_COMMISSION_RATE

    // Warn about unusually high commissions (possible fraud/error)
    if (commissionAmount > MAX_COMMISSION_AMOUNT) {
      console.warn('UNUSUALLY_HIGH_COMMISSION:', {
        orderId,
        orderTotal,
        commissionAmount,
        creatorId: creator.id,
      })
    }

    // ========================================================================
    // 5. CREATE COMMISSION TRANSACTION
    // ========================================================================
    const transaction = await prisma.transaction.create({
      data: {
        type: 'COMMISSION',
        amount: commissionAmount,
        status: 'COMPLETED',
        userId: creator.id,
        referralOrderId: orderId,
        sourceUserId: null, // ← CRITICAL: Null = creator commission (not affiliate)
        description: `Creator commission from grocery order #${orderNumber || orderId.slice(-8)}`,
      },
    })

    // ========================================================================
    // 6. UPDATE CONTENT POST EARNINGS (OPTIONAL)
    // ========================================================================
    // This links earnings to creator's published content
    try {
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
    } catch (contentUpdateError) {
      // Non-critical - log but don't fail the commission
      console.warn('CONTENT_POST_UPDATE_FAILED:', contentUpdateError)
    }

    // ========================================================================
    // 7. LOG SUCCESS
    // ========================================================================
    console.log('COMMISSION_TRACKED:', {
      transactionId: transaction.id,
      creatorId: creator.id,
      orderId,
      amount: commissionAmount,
      timestamp: new Date().toISOString(),
    })

    return {
      success: true,
      commission: {
        id: transaction.id,
        amount: commissionAmount,
        creatorId: creator.id,
        creatorName: creator.fullName || 'Unknown Creator',
      },
    }
  } catch (error) {
    console.error('TRACK_COMMISSION_ERROR:', error)
    return {
      success: false,
      error: 'Failed to track commission. Please try again.',
    }
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Gets total commissions for a specific order (should be 0 or 1)
 * Useful for debugging duplicate commission issues
 */
export async function getCommissionsForOrder(orderId: string) {
  return await prisma.transaction.findMany({
    where: {
      type: 'COMMISSION',
      referralOrderId: orderId,
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      user: {
        select: {
          fullName: true,
          username: true,
        },
      },
    },
  })
}

/**
 * Gets all grocery commissions for a creator
 */
export async function getCreatorGroceryCommissions(creatorId: string) {
  return await prisma.transaction.findMany({
    where: {
      userId: creatorId,
      type: 'COMMISSION',
      sourceUserId: null, // Null = grocery commission
      referralOrderId: { not: null },
    },
    select: {
      id: true,
      amount: true,
      referralOrderId: true,
      description: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Gets total grocery earnings for a creator
 */
export async function getCreatorGroceryEarnings(creatorId: string) {
  const result = await prisma.transaction.aggregate({
    where: {
      userId: creatorId,
      type: 'COMMISSION',
      sourceUserId: null,
      referralOrderId: { not: null },
      status: 'COMPLETED',
    },
    _sum: {
      amount: true,
    },
    _count: true,
  })

  return {
    totalEarnings: result._sum.amount || 0,
    totalOrders: result._count,
  }
}
