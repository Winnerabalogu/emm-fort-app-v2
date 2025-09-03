// app/api/creator/content/captions/reorder/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserPreferenceService } from '@/lib/services/userPreferenceService';

// PUT - Reorder caption templates
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { captionOrder } = body;

    // Validate captionOrder structure
    if (!Array.isArray(captionOrder)) {
      return NextResponse.json({ 
        error: 'captionOrder must be an array' 
      }, { status: 400 });
    }

    // Basic validation for each order item
    for (const item of captionOrder) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json({ 
          error: 'Each order item must have id and order properties' 
        }, { status: 400 });
      }
    }

    const success = await UserPreferenceService.setCaptionOrder(userId, captionOrder);
    
    if (success) {
      return NextResponse.json({
        message: 'Caption order updated successfully',
        captionOrder: captionOrder
      });
    } else {
      throw new Error('Failed to save caption order');
    }
  } catch (error) {
    console.error("CAPTION_REORDER_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to reorder captions' 
    }, { status: 500 });
  }
}

// GET - Get current caption order
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isCreator: true }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    const captionOrder = await UserPreferenceService.getCaptionOrder(userId);
    
    return NextResponse.json({
      captionOrder: captionOrder
    });

  } catch (error) {
    console.error("GET_CAPTION_ORDER_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to get caption order' 
    }, { status: 500 });
  }
}