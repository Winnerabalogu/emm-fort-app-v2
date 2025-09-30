// app/api/creator/content/schedule/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const schedulePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  platform: z.enum(['Instagram', 'TikTok', 'Both']),
  type: z.enum(['Post', 'Story', 'Reel', 'Video', 'Carousel']),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  caption: z.string().min(1, 'Caption is required').max(2200, 'Caption too long'),
  hashtags: z.array(z.string()).max(30, 'Too many hashtags'),
  description: z.string().optional()
});

// POST - Schedule a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const validationResult = schedulePostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error
      }, { status: 400 });
    }

    const { title, platform, type, scheduledDate, scheduledTime, caption, hashtags, description } = validationResult.data;

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

    // Validate scheduled date/time is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json({
        error: 'Scheduled date and time must be in the future'
      }, { status: 400 });
    }

    // Create scheduled post
    const scheduledPost = await prisma.contentPost.create({
      data: {
        userId,
        title,
        platform: platform === 'Both' ? 'instagram' : platform.toLowerCase(),
        type: type.toLowerCase(),
        content: caption,
        description: description || null,
        hashtags: hashtags || [],
        status: 'SCHEDULED',
        publishedAt: scheduledDateTime,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        earnings: 0
      }
    });

    return NextResponse.json({
      message: 'Post scheduled successfully',
      post: {
        id: scheduledPost.id,
        title: scheduledPost.title,
        scheduledFor: scheduledDateTime.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error("SCHEDULE_POST_ERROR:", error);
    return NextResponse.json({ 
      error: 'Failed to schedule post' 
    }, { status: 500 });
  }
};

// GET - Get scheduled posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format
    const status = searchParams.get('status'); // scheduled, published, draft

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

    // Build filter
    const where: {
      userId: string;
      status?: string;
      publishedAt?: { gte: Date; lte: Date };
    } = { userId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      where.publishedAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const scheduledPosts = await prisma.contentPost.findMany({
      where,
      select: {
        id: true,
        title: true,
        platform: true,
        type: true,
        content: true,
        status: true,
        publishedAt: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        earnings: true,
        createdAt: true
      },
      orderBy: { publishedAt: 'asc' }
    });

    const processedPosts = scheduledPosts.map(post => ({
      id: post.id,
      title: post.title,
      platform: post.platform,
      type: post.type,
      caption: post.content,
      status: post.status,
      scheduledDate: post.publishedAt?.toISOString().split('T')[0],
      scheduledTime: post.publishedAt?.toISOString().split('T')[1]?.substring(0, 5),
      views: post.views,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      earnings: Number(post.earnings.toFixed(2))
    }));

    return NextResponse.json({
      posts: processedPosts,
      total: processedPosts.length
    });

  } catch (error) {
    console.error("GET_SCHEDULED_POSTS_ERROR:", error);
    return NextResponse.json({ 
      error: 'Failed to fetch scheduled posts' 
    }, { status: 500 });
  }
};

// PUT - Update scheduled post
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Validate request body (partial update allowed)
    const updateSchema = schedulePostSchema.partial();
    const validationResult = updateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error
      }, { status: 400 });
    }

    // Verify post ownership
    const existingPost = await prisma.contentPost.findFirst({
      where: {
        id: postId,
        userId: userId
      }
    });

    if (!existingPost) {
      return NextResponse.json({ 
        error: 'Post not found or access denied' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      publishedAt?: Date;
      content?: string;
      platform?: string;
      type?: string;
      title?: string;
      description?: string;
      hashtags?: string[];
    } = {};
    const { scheduledDate, scheduledTime, caption, platform, type, ...otherFields } = validationResult.data;

    // Handle scheduled date/time
    if (scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        return NextResponse.json({
          error: 'Scheduled date and time must be in the future'
        }, { status: 400 });
      }
      updateData.publishedAt = scheduledDateTime;
    }

    // Handle other fields
    if (caption) updateData.content = caption;
    if (platform) updateData.platform = platform === 'Both' ? 'instagram' : platform.toLowerCase();
    if (type) updateData.type = type.toLowerCase();
    Object.assign(updateData, otherFields);

    // Update post
    const updatedPost = await prisma.contentPost.update({
      where: { id: postId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        updatedAt: updatedPost.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error("UPDATE_SCHEDULED_POST_ERROR:", error);
    return NextResponse.json({ 
      error: 'Failed to update scheduled post' 
    }, { status: 500 });
  }
};

// DELETE - Delete scheduled post
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify post ownership
    const existingPost = await prisma.contentPost.findFirst({
      where: {
        id: postId,
        userId: userId
      }
    });

    if (!existingPost) {
      return NextResponse.json({ 
        error: 'Post not found or access denied' 
      }, { status: 404 });
    }

    // Delete post
    await prisma.contentPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error("DELETE_SCHEDULED_POST_ERROR:", error);
    return NextResponse.json({ 
      error: 'Failed to delete scheduled post' 
    }, { status: 500 });
  }
};