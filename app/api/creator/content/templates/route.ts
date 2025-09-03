// app/api/creator/content/templates/route.ts - Perfected version
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserPreferenceService } from '@/lib/services/userPreferenceService';

// Types for the route
interface WhereClause {
  isActive?: boolean;
  category?: string;
  platform?: { has: string };
  difficulty?: { equals: string; mode: 'insensitive' };
  type?: string | { not: string };
}

interface OrderItem {
  id: string;
  position: number;
}

// GET - Fetch content templates with user preferences applied
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'templates' or 'captions'
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const difficulty = searchParams.get('difficulty');

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isCreator: true, 
        username: true,
        contentStyle: true 
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    // Build dynamic where clause for templates
    const templateWhereClause: WhereClause = { isActive: true };
    if (category && category !== 'all') {
      templateWhereClause.category = category;
    }
    if (platform && platform !== 'all') {
      templateWhereClause.platform = { has: platform };
    }
    if (difficulty && difficulty !== 'all') {
      templateWhereClause.difficulty = { equals: difficulty, mode: 'insensitive' };
    }

    // Build dynamic where clause for captions (assuming captions are ContentTemplates with type 'caption')
    const captionWhereClause: WhereClause = { 
      isActive: true,
      type: 'caption' // Assuming captions are differentiated by type
    };
    if (category && category !== 'all') {
      captionWhereClause.category = category;
    }

    // Fetch data from database
    const [templates, captions, templateUsageHistory] = await Promise.all([
      prisma.contentTemplate.findMany({
        where: { ...templateWhereClause, type: { not: 'caption' } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contentTemplate.findMany({
        where: captionWhereClause,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contentPost.groupBy({
        by: ['templateId'],
        where: { 
          userId: userId,
          templateId: { not: null }
        },
        _count: { templateId: true }
      })
    ]);

    // Generate referral code for template personalization
    const referralCode = `${user.username?.toUpperCase() || 'USER'}${new Date().getFullYear()}`;

    // Get saved orders from user preferences and convert them to the expected format
    const [savedTemplateOrderRaw, savedCaptionOrderRaw] = await Promise.all([
      UserPreferenceService.getTemplateOrder(userId),
      UserPreferenceService.getCaptionOrder(userId)
    ]);

    // Convert TemplateOrderItem[] to OrderItem[] format expected by applyCustomOrder
    const savedTemplateOrder: OrderItem[] = savedTemplateOrderRaw.map((item, index) => ({
      id: item.id,
      position: item.order ?? index
    }));

    const savedCaptionOrder: OrderItem[] = savedCaptionOrderRaw.map((item, index) => ({
      id: item.id,
      position: item.order ?? index
    }));

    // Apply custom order to templates
    const orderedTemplates = applyCustomOrder(templates, savedTemplateOrder);
    const orderedCaptions = applyCustomOrder(captions, savedCaptionOrder);

    // Personalize content with user's referral code
    const personalizedTemplates = orderedTemplates.map(template => ({
      ...template,
      captionTemplate: template.captionTemplate?.replace(/\{\{REFERRAL_CODE\}\}/g, referralCode) || '',
      hashtags: template.hashtags.map(tag => tag.replace('{{REFERRAL_CODE}}', referralCode))
    }));

    const personalizedCaptions = orderedCaptions.map(caption => ({
      ...caption,
      captionTemplate: caption.captionTemplate?.replace(/\{\{REFERRAL_CODE\}\}/g, referralCode) || '',
      hashtags: caption.hashtags.map(tag => tag.replace('{{REFERRAL_CODE}}', referralCode))
    }));

    // Create usage map for templates
    const usageMap = new Map(
      templateUsageHistory.map(item => [item.templateId, item._count.templateId])
    );

    // Add usage stats to templates
    const templatesWithUsage = personalizedTemplates.map(template => ({
      ...template,
      usageCount: usageMap.get(template.id) || 0,
      isPopular: (usageMap.get(template.id) || 0) > 2
    }));

    // Get unique categories and platforms for filters
    const templateCategories = [...new Set(templates.map(t => t.category))];
    const captionCategories = [...new Set(captions.map(c => c.category))];
    const allPlatforms = [...new Set(templates.flatMap(t => t.platform))];
    const allDifficulties = [...new Set(templates.map(t => t.difficulty))];

    // Return based on type requested
    if (type === 'captions') {
      return NextResponse.json({
        success: true,
        data: {
          captions: personalizedCaptions,
          totalCount: personalizedCaptions.length,
          categories: captionCategories,
          userInfo: {
            referralCode,
            contentStyle: user.contentStyle
          }
        }
      });
    }

    if (type === 'templates') {
      return NextResponse.json({
        success: true,
        data: {
          templates: templatesWithUsage,
          totalCount: templatesWithUsage.length,
          categories: templateCategories,
          platforms: allPlatforms,
          difficulties: allDifficulties,
          userInfo: {
            referralCode,
            contentStyle: user.contentStyle
          }
        }
      });
    }

    // Return both if no specific type requested
    return NextResponse.json({
      success: true,
      data: {
        templates: templatesWithUsage,
        captions: personalizedCaptions,
        categories: {
          templates: templateCategories,
          captions: captionCategories
        },
        platforms: allPlatforms,
        difficulties: allDifficulties,
        userInfo: {
          referralCode,
          contentStyle: user.contentStyle
        },
        stats: {
          totalTemplates: templates.length,
          totalCaptions: captions.length,
          userTemplateUsage: templateUsageHistory.length
        }
      }
    });

  } catch (error) {
    console.error("TEMPLATES_GET_ERROR:", error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch templates',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// POST - Request new template or custom template request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isCreator: true, 
        username: true,
        email: true,
        contentStyle: true
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    const { 
      type, // 'template' or 'caption'
      title,
      description,
      category,
      platform,
      contentStyle,
      specificRequests 
    } = body;

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json({ 
        success: false,
        error: 'Type, title, and description are required',
        details: {
          required: ['type', 'title', 'description'],
          provided: { type: !!type, title: !!title, description: !!description }
        }
      }, { status: 400 });
    }

    // Validate type
    if (!['template', 'caption'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Must be "template" or "caption"'
      }, { status: 400 });
    }

    // Create template request
    const templateRequest = await prisma.templateRequest.create({
      data: {
        userId: userId,
        type: type,
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || 'general',
        platform: platform?.trim() || 'instagram',
        contentStyle: contentStyle?.trim() || user.contentStyle || null,
        specificRequests: specificRequests?.trim() || null,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Template request submitted successfully',
        request: {
          id: templateRequest.id,
          type: templateRequest.type,
          title: templateRequest.title,
          status: templateRequest.status,
          createdAt: templateRequest.createdAt
        },
        estimatedCompletion: '2-3 business days'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("TEMPLATE_REQUEST_ERROR:", error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process template request',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// PUT - Update template order (for drag and drop)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, order } = body;

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isCreator: true }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied. Creator account required.' 
      }, { status: 403 });
    }

    // Validate input
    if (!type || !order || !Array.isArray(order)) {
      return NextResponse.json({
        success: false,
        error: 'Type and order array are required'
      }, { status: 400 });
    }

    if (!['templates', 'captions'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Must be "templates" or "captions"'
      }, { status: 400 });
    }

    // Save the order using your existing UserPreferenceService
    if (type === 'templates') {
      await UserPreferenceService.setTemplateOrder(userId, order);
    } else {
      await UserPreferenceService.setCaptionOrder(userId, order);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${type} order updated successfully`,
        orderCount: order.length
      }
    });

  } catch (error) {
    console.error("TEMPLATE_ORDER_UPDATE_ERROR:", error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update template order',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// Helper function to apply custom order
function applyCustomOrder<T extends { id: string }>(
  items: T[], 
  savedOrder: OrderItem[] | null
): T[] {
  if (!savedOrder || savedOrder.length === 0) {
    return items;
  }

  const itemMap = new Map(items.map(item => [item.id, item]));
  const orderedItems: T[] = [];

  // Sort saved order by position
  const sortedOrder = savedOrder.sort((a, b) => a.position - b.position);

  // Add items in saved order
  sortedOrder.forEach((orderItem) => {
    const item = itemMap.get(orderItem.id);
    if (item) {
      orderedItems.push(item);
      itemMap.delete(orderItem.id);
    }
  });

  // Add remaining items that weren't in the saved order
  itemMap.forEach(item => {
    orderedItems.push(item);
  });

  return orderedItems;
}