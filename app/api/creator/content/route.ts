/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/creator/content/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'facebook'])
    .refine(val => ['instagram', 'tiktok', 'youtube', 'facebook'].includes(val), {
      message: 'Invalid platform',
    }),
  type: z.enum(['reel', 'post', 'video', 'story', 'carousel'])
    .refine(val => ['reel', 'post', 'video', 'story', 'carousel'].includes(val), {
      message: 'Invalid content type',
    }),
  description: z.string().max(1000, 'Description too long').optional(),
  hashtags: z.array(z.string()).max(30, 'Too many hashtags').optional(),
  templateId: z.string().optional()
});

const updateContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  hashtags: z.array(z.string()).max(30, 'Too many hashtags').optional(),
  views: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  earnings: z.number().min(0).optional()
});

// GET - Fetch user's content posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const platform = searchParams.get('platform');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isCreator: true }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ error: 'Access denied. Creator account required.' }, { status: 403 });
    }

    // Build filter object
    const where: any = { userId };
    if (platform && platform !== 'all') {
      where.platform = platform;
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'views', 'likes', 'comments', 'shares', 'earnings', 'title'];
    const validSortOrders = ['asc', 'desc'];
    
    const orderBy: any = {};
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Fetch content posts with pagination
    const [contentPosts, totalCount] = await Promise.all([
      prisma.contentPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          platform: true,
          type: true,
          description: true,
          hashtags: true,
          views: true,
          likes: true,
          comments: true,
          shares: true,
          earnings: true,
          templateId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contentPost.count({ where })
    ]);

    // Calculate engagement metrics
    const processedContent = contentPosts.map(post => {
      const totalEngagement = post.likes + post.comments + post.shares;
      const engagementRate = post.views > 0 ? ((totalEngagement / post.views) * 100) : 0;
      
      return {
        ...post,
        totalEngagement,
        engagementRate: Number(engagementRate.toFixed(2)),
        earnings: Number(post.earnings.toFixed(2)),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
      };
    });

    // Get summary statistics
    const summaryStats = await prisma.contentPost.aggregate({
      where: { userId },
      _sum: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
        earnings: true
      },
      _count: true,
      _avg: {
        views: true,
        likes: true,
        earnings: true
      }
    });

    // Platform breakdown
    const platformStats = await prisma.contentPost.groupBy({
      by: ['platform'],
      where: { userId },
      _count: { platform: true },
      _sum: { 
        views: true,
        likes: true,
        earnings: true
      }
    });

    const contentData = {
      content: processedContent,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      summary: {
        totalPosts: summaryStats._count,
        totalViews: summaryStats._sum.views || 0,
        totalLikes: summaryStats._sum.likes || 0,
        totalComments: summaryStats._sum.comments || 0,
        totalShares: summaryStats._sum.shares || 0,
        totalEarnings: Number((summaryStats._sum.earnings || 0).toFixed(2)),
        avgViews: Number((summaryStats._avg.views || 0).toFixed(0)),
        avgLikes: Number((summaryStats._avg.likes || 0).toFixed(0)),
        avgEarnings: Number((summaryStats._avg.earnings || 0).toFixed(2))
      },
      platformBreakdown: platformStats.map(stat => ({
        platform: stat.platform,
        postCount: stat._count.platform,
        totalViews: stat._sum.views || 0,
        totalLikes: stat._sum.likes || 0,
        totalEarnings: Number((stat._sum.earnings || 0).toFixed(2))
      }))
    };

    return NextResponse.json(contentData);

  } catch (error: unknown) {
    console.error("CREATOR_CONTENT_GET_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to fetch content data' }, { status: 500 });
  }
}

// POST - Create new content post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const validationResult = createContentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error
      }, { status: 400 });
    }

    const { title, platform, type, description, hashtags, templateId } = validationResult.data;

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isCreator: true }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ error: 'Access denied. Creator account required.' }, { status: 403 });
    }

    // Create content post
    const contentPost = await prisma.contentPost.create({
      data: {
        userId,
        title,
        platform,
        type,
        description: description || null,
        hashtags: hashtags || [],
        templateId: templateId || null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        earnings: 0
      },
      select: {
        id: true,
        title: true,
        platform: true,
        type: true,
        description: true,
        hashtags: true,
        templateId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Content post created successfully',
      content: {
        ...contentPost,
        createdAt: contentPost.createdAt.toISOString()
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("CREATOR_CONTENT_POST_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to create content post' }, { status: 500 });
  }
}

// PUT - Update content post
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateContentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error
      }, { status: 400 });
    }

    // Verify content ownership
    const existingContent = await prisma.contentPost.findFirst({
      where: {
        id: contentId,
        userId: userId
      }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found or access denied' }, { status: 404 });
    }

    // Update content post
    const updatedContent = await prisma.contentPost.update({
      where: { id: contentId },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        platform: true,
        type: true,
        description: true,
        hashtags: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        earnings: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Content post updated successfully',
      content: {
        ...updatedContent,
        earnings: Number(updatedContent.earnings.toFixed(2)),
        updatedAt: updatedContent.updatedAt.toISOString()
      }
    });

  } catch (error: unknown) {
    console.error("CREATOR_CONTENT_PUT_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to update content post' }, { status: 500 });
  }
}

// DELETE - Delete content post
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Verify content ownership
    const existingContent = await prisma.contentPost.findFirst({
      where: {
        id: contentId,
        userId: userId
      }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found or access denied' }, { status: 404 });
    }

    // Delete content post
    await prisma.contentPost.delete({
      where: { id: contentId }
    });

    return NextResponse.json({
      message: 'Content post deleted successfully'
    });

  } catch (error: unknown) {
    console.error("CREATOR_CONTENT_DELETE_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to delete content post' }, { status: 500 });
  }
}