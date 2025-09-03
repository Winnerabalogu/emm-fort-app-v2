// app/api/creator/content/captions/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Mock caption data - Replace with database queries when you have CaptionTemplate table
const MOCK_CAPTIONS = [
  {
    id: '1',
    title: 'Grocery Haul Caption',
    platform: 'Instagram',
    content: 'Just picked up these amazing fresh groceries! 🛒✨\n\nSwipe to see what made it into my cart this week. Using my referral code helps support my content - thank you! 💕',
    hashtags: ['#groceryhaul', '#freshfood', '#shopping', '#healthyeating', '#mealprep'],
    category: 'Grocery Haul',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Recipe Share Caption',
    platform: 'TikTok',
    content: 'This recipe is a game changer! 👩‍🍳\n\nAll ingredients available through my link - makes shopping so much easier. Who\'s trying this tonight?',
    hashtags: ['#recipe', '#cooking', '#easymeal', '#foodie', '#homecooking'],
    category: 'Recipe',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    title: 'Product Review Caption',
    platform: 'Both',
    content: 'Honest review time! 📝\n\nI\'ve been using this for a week and here are my thoughts... Link in bio for easy ordering!',
    hashtags: ['#review', '#honest', '#productreview', '#recommendation', '#shopping'],
    category: 'Review',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '4',
    title: 'Budget Shopping Caption',
    platform: 'Instagram',
    content: 'Budget-friendly finds alert! 💰\n\nProving you don\'t need to break the bank for quality groceries. Save this post for your next shopping trip!',
    hashtags: ['#budgetfriendly', '#savemoney', '#smartshopping', '#budgettips', '#frugalliving'],
    category: 'Budget Tips',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    title: 'Meal Prep Motivation',
    platform: 'Both',
    content: 'Sunday meal prep session complete! ✅\n\nSpending 2 hours today saves me 10 hours this week. What are you prepping today?',
    hashtags: ['#mealprep', '#sundayprep', '#mealplanning', '#healthyliving', '#productivity'],
    category: 'Meal Prep',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '6',
    title: 'Seasonal Produce Caption',
    platform: 'Instagram',
    content: 'Fall flavors are here! 🍂\n\nThese seasonal picks are at their peak right now. Swipe to see how I\'m using them in this week\'s meals.',
    hashtags: ['#seasonalproduce', '#fallfoods', '#eattheseasin', '#freshproduce', '#healthyeating'],
    category: 'Seasonal',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

// GET - Fetch caption templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');

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

    try {
      // Get user's caption order preference
      const captionOrderPreference = await prisma.userPreference.findFirst({
        where: {
          userId: userId,
          key: 'captionOrder'
        }
      });

      let captions = [...MOCK_CAPTIONS];

      // Apply filters
      if (platform && platform !== 'all') {
        captions = captions.filter(c => 
          c.platform === platform || c.platform === 'Both'
        );
      }
      
      if (category && category !== 'all') {
        captions = captions.filter(c => 
          c.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Apply custom order if exists
      if (captionOrderPreference) {
        try {
          const customOrder = JSON.parse(captionOrderPreference.value);
          const orderedCaptions = [];
          const captionMap = new Map(captions.map(c => [c.id, c]));

          // Add captions in custom order
          customOrder.forEach((orderItem: { id: string; order: number }) => {
            const caption = captionMap.get(orderItem.id);
            if (caption) {
              orderedCaptions.push(caption);
              captionMap.delete(orderItem.id);
            }
          });

          // Add remaining captions that weren't in custom order
          captionMap.forEach(caption => {
            orderedCaptions.push(caption);
          });

          captions = orderedCaptions;
        } catch (parseError) {
          console.error('Error parsing caption order:', parseError);
          // Use default order if parsing fails
        }
      }

      return NextResponse.json({
        captions: captions.map(caption => ({
          ...caption,
          createdAt: caption.createdAt.toISOString(),
          updatedAt: caption.updatedAt.toISOString()
        })),
        total: captions.length,
        filters: {
          platforms: ['Instagram', 'TikTok', 'Both'],
          categories: ['Grocery Haul', 'Recipe', 'Review', 'Budget Tips', 'Meal Prep', 'Seasonal']
        }
      });

    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      
      // Fallback to mock data without custom ordering
      let captions = [...MOCK_CAPTIONS];

      // Apply filters
      if (platform && platform !== 'all') {
        captions = captions.filter(c => 
          c.platform === platform || c.platform === 'Both'
        );
      }
      
      if (category && category !== 'all') {
        captions = captions.filter(c => 
          c.category.toLowerCase() === category.toLowerCase()
        );
      }

      return NextResponse.json({
        captions: captions.map(caption => ({
          ...caption,
          createdAt: caption.createdAt.toISOString(),
          updatedAt: caption.updatedAt.toISOString()
        })),
        total: captions.length,
        filters: {
          platforms: ['Instagram', 'TikTok', 'Both'],
          categories: ['Grocery Haul', 'Recipe', 'Review', 'Budget Tips', 'Meal Prep', 'Seasonal']
        }
      });
    }

  } catch (error: unknown) {
    console.error("CAPTION_TEMPLATES_GET_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to fetch caption templates' 
    }, { status: 500 });
  }
}

// POST - Request new caption (for future implementation)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

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

    // For now, just log the caption request
    console.log('Caption request:', {
      userId,
      request: body
    });

    return NextResponse.json({
      message: 'Caption request received. You will be notified when new captions are available.',
      status: 'pending'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("CAPTION_REQUEST_ERROR: ", error);
    return NextResponse.json({ 
      error: 'Failed to process caption request' 
    }, { status: 500 });
  }
}