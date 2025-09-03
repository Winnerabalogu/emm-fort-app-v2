// app/api/creator/content/templates/reorder/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserPreferenceService } from '@/lib/services/userPreferenceService';

// PUT - Reorder content templates
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { templateOrder } = body;

    // Validate templateOrder structure
    if (!Array.isArray(templateOrder)) {
      return NextResponse.json({ 
        error: 'templateOrder must be an array' 
      }, { status: 400 });
    }

    // Basic validation for each order item
    for (const item of templateOrder) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json({ 
          error: 'Each order item must have id and order properties' 
        }, { status: 400 });
      }
    }

    const success = await UserPreferenceService.setTemplateOrder(userId, templateOrder);
    
    if (success) {
      return NextResponse.json({
        message: 'Template order updated successfully',
        templateOrder: templateOrder
      });
    } else {
      throw new Error('Failed to save template order');
    }
  } catch (error) {
    console.error("TEMPLATE_REORDER_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to reorder templates' 
    }, { status: 500 });
  }
}

// GET - Get current template order
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const templateOrder = await UserPreferenceService.getTemplateOrder(userId);
    
    return NextResponse.json({
      templateOrder: templateOrder
    });
  } catch (error) {
    console.error("GET_TEMPLATE_ORDER_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to get template order' 
    }, { status: 500 });
  }
}