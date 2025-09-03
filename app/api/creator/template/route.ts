// app/api/creator/templates/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Mock template data - In production, these would be stored in database
const contentTemplates = [
  {
    id: 'template_1',
    title: 'Grocery Haul Unboxing',
    category: 'unboxing',
    type: 'video',
    platform: ['instagram', 'tiktok'],
    description: 'Perfect for showing off fresh groceries and using your referral code naturally in the content.',
    thumbnailUrl: '/templates/grocery-haul-unboxing.jpg',
    duration: '15-30s',
    difficulty: 'Easy',
    engagement: 'High',
    tags: ['Unboxing', 'Fresh Groceries', 'Lifestyle'],
    instructions: [
      'Set up your phone camera in a well-lit area',
      'Arrange your EMM-FORT grocery packages prominently',
      'Start recording while opening the first package',
      'Show excitement about the fresh produce quality',
      'Mention your referral code naturally: "Use my code [CODE] for amazing deals!"',
      'Display each item briefly, focusing on freshness',
      'End with a call-to-action about trying EMM-FORT'
    ],
    captionTemplate: "Just unboxed my weekly groceries from @emmfort! 🛒✨ The quality is incredible and everything arrived so fresh! Use my code {{REFERRAL_CODE}} to get amazing deals on your next order. Who else loves the convenience of grocery delivery? #GroceryHaul #FreshProduce #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#GroceryHaul', '#FreshProduce', '#EMMFORT', '#ConvenientShopping', '#HealthyLiving'],
    tips: [
      'Film in natural lighting for best results',
      'Keep the energy high and enthusiastic',
      'Show genuine reactions to product quality',
      'Mention specific benefits like freshness or convenience'
    ]
  },
  {
    id: 'template_2',
    title: 'Weekly Meal Prep with EMM-FORT',
    category: 'lifestyle',
    type: 'video',
    platform: ['instagram', 'tiktok', 'youtube'],
    description: 'Show your meal prep routine featuring ingredients from EMM-FORT, perfect for health-conscious audiences.',
    thumbnailUrl: '/templates/meal-prep.jpg',
    duration: '30-60s',
    difficulty: 'Medium',
    engagement: 'Very High',
    tags: ['Meal Prep', 'Healthy Living', 'Organization', 'Cooking'],
    instructions: [
      'Plan 3-4 simple recipes using EMM-FORT ingredients',
      'Set up a clean, organized cooking space',
      'Film the prep process in time-lapse or regular speed',
      'Highlight the quality of ingredients',
      'Show the organization and storage process',
      'Include your referral code in voiceover or text overlay',
      'End with the finished meal prep containers'
    ],
    captionTemplate: "Sunday meal prep done! ✅ Using fresh ingredients from @emmfort makes such a difference in taste and quality. Swipe to see what I prepped for the week! Use {{REFERRAL_CODE}} for your grocery delivery - it saves me so much time! #MealPrep #HealthyEating #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#MealPrep', '#HealthyEating', '#EMMFORT', '#SundayPrep', '#HealthyLifestyle'],
    tips: [
      'Use overhead shots for better visual appeal',
      'Speed up repetitive tasks in editing',
      'Show before and after organization',
      'Include nutritional benefits in caption'
    ]
  },
  {
    id: 'template_3',
    title: 'Fresh Produce Flat Lay',
    category: 'photography',
    type: 'image',
    platform: ['instagram', 'facebook'],
    description: 'Beautiful styled photography showcasing fresh produce from EMM-FORT in an aesthetically pleasing layout.',
    thumbnailUrl: '/templates/produce-flatlay.jpg',
    duration: 'N/A',
    difficulty: 'Easy',
    engagement: 'Medium',
    tags: ['Photography', 'Fresh Produce', 'Aesthetic', 'Healthy'],
    instructions: [
      'Choose a clean, neutral background (white or marble works well)',
      'Select the most photogenic produce from your EMM-FORT order',
      'Arrange items in a visually pleasing pattern',
      'Use natural lighting from a window',
      'Take photos from directly above',
      'Edit to enhance colors and brightness',
      'Include EMM-FORT branding subtly if possible'
    ],
    captionTemplate: "Look at this gorgeous fresh produce from @emmfort! 🥬🥕🍅 Quality like this makes cooking so much more enjoyable. The colors, the freshness - everything is perfect! Use my code {{REFERRAL_CODE}} to get premium groceries delivered to your door. #FreshProduce #HealthyChoices #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#FreshProduce', '#HealthyChoices', '#EMMFORT', '#FoodPhotography', '#CleanEating'],
    tips: [
      'Remove any stickers or packaging for cleaner look',
      'Use odd numbers of items for better composition',
      'Add props like wooden cutting boards or baskets',
      'Ensure good contrast between items and background'
    ]
  },
  {
    id: 'template_4',
    title: 'Quick Recipe Tutorial',
    category: 'cooking',
    type: 'video',
    platform: ['instagram', 'tiktok', 'youtube'],
    description: 'Create engaging recipe content using EMM-FORT ingredients with step-by-step instructions.',
    thumbnailUrl: '/templates/recipe-tutorial.jpg',
    duration: '60s+',
    difficulty: 'Medium',
    engagement: 'High',
    tags: ['Recipe', 'Cooking', 'Tutorial', 'Food'],
    instructions: [
      'Choose a simple, visually appealing recipe',
      'Prep all EMM-FORT ingredients beforehand',
      'Film each step clearly with close-up shots',
      'Use text overlays for ingredient lists and instructions',
      'Show the cooking process in real-time or time-lapse',
      'Highlight the quality of EMM-FORT ingredients',
      'End with the finished dish and taste reaction'
    ],
    captionTemplate: "Made this delicious [RECIPE NAME] using fresh ingredients from @emmfort! 👨‍🍳 The quality makes such a difference in the final taste. Save this recipe and try it yourself! Use {{REFERRAL_CODE}} for premium ingredients delivered fresh. Recipe details below! #Recipe #Cooking #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#Recipe', '#Cooking', '#EMMFORT', '#Foodie', '#HomeCooking'],
    tips: [
      'Keep cuts quick and engaging',
      'Show your genuine reaction when tasting',
      'Include cooking tips and tricks',
      'Mention specific ingredient benefits'
    ]
  },
  {
    id: 'template_5',
    title: 'Family Shopping Experience',
    category: 'lifestyle',
    type: 'video',
    platform: ['instagram', 'facebook', 'tiktok'],
    description: 'Share how EMM-FORT makes family grocery shopping easier and more convenient.',
    thumbnailUrl: '/templates/family-shopping.jpg',
    duration: '30-45s',
    difficulty: 'Easy',
    engagement: 'High',
    tags: ['Family', 'Convenience', 'Lifestyle', 'Parenting'],
    instructions: [
      'Include family members in the content naturally',
      'Show the convenience of delivery arriving at home',
      'Highlight kid-friendly healthy options',
      'Demonstrate time saved versus traditional shopping',
      'Show family members enjoying the fresh products',
      'Include your referral code in conversation',
      'Focus on the family benefits'
    ],
    captionTemplate: "EMM-FORT just made our family's week so much easier! 👨‍👩‍👧‍👦🛒 Fresh groceries delivered while we focus on family time. The kids love the quality produce too! Use {{REFERRAL_CODE}} to make your family grocery routine this convenient. #FamilyLife #ConvenientShopping #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#FamilyLife', '#ConvenientShopping', '#EMMFORT', '#BusyParents', '#FamilyTime'],
    tips: [
      'Keep content authentic and relatable',
      'Show real family interactions',
      'Highlight time-saving benefits',
      'Include children naturally if appropriate'
    ]
  }
];

const captionTemplates = [
  {
    id: 'caption_1',
    title: 'Excitement & Quality Focus',
    platform: 'instagram',
    category: 'general',
    content: "Just got my @emmfort delivery and I'm obsessed! 😍 The quality is absolutely incredible - everything is so fresh and perfectly packed. This is exactly why I keep coming back! Use my code {{REFERRAL_CODE}} for amazing deals on your first order. Trust me, you won't regret it! #EMMFORT #FreshGroceries #{{REFERRAL_CODE}}",
    hashtags: ['#EMMFORT', '#FreshGroceries', '#QualityFood', '#GroceryDelivery'],
    tone: 'Enthusiastic'
  },
  {
    id: 'caption_2',
    title: 'Convenience & Time-Saving',
    platform: 'tiktok',
    category: 'lifestyle',
    content: "POV: You save 2+ hours every week by getting groceries delivered fresh to your door 🕐✨ @emmfort has literally changed my routine! Use {{REFERRAL_CODE}} to get started - thank me later! #TimeSaver #EMMFORT #{{REFERRAL_CODE}} #ConvenientLife",
    hashtags: ['#TimeSaver', '#EMMFORT', '#ConvenientLife', '#LifeHack'],
    tone: 'Trendy'
  },
  {
    id: 'caption_3',
    title: 'Health & Wellness Focus',
    platform: 'instagram',
    category: 'health',
    content: "Nourishing my body with the freshest produce from @emmfort 🥬🥕 When you start with quality ingredients, everything just tastes better and feels better! Ready to upgrade your grocery game? Use {{REFERRAL_CODE}} for premium quality delivered fresh. #HealthyLiving #WellnessJourney #EMMFORT #{{REFERRAL_CODE}}",
    hashtags: ['#HealthyLiving', '#WellnessJourney', '#EMMFORT', '#CleanEating'],
    tone: 'Wellness-focused'
  },
  {
    id: 'caption_4',
    title: 'Before & After Comparison',
    platform: 'instagram',
    category: 'comparison',
    content: "Before EMM-FORT: Spending hours grocery shopping, dealing with traffic, long queues, and sometimes questionable produce quality 😤 After EMM-FORT: Fresh, high-quality groceries delivered to my door while I focus on what matters! Use {{REFERRAL_CODE}} to make the switch. Your future self will thank you! #EMMFORT #{{REFERRAL_CODE}} #GameChanger",
    hashtags: ['#EMMFORT', '#GameChanger', '#ConvenientShopping', '#QualityFirst'],
    tone: 'Problem-Solution'
  }
];

// GET - Fetch content templates and captions
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
      return NextResponse.json({ error: 'Access denied. Creator account required.' }, { status: 403 });
    }

    // Generate referral code for template personalization
    const referralCode = `${user.username?.toUpperCase()}${new Date().getFullYear()}`;

    let filteredTemplates = contentTemplates;
    let filteredCaptions = captionTemplates;

    // Apply filters for templates
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    if (platform && platform !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.platform.includes(platform));
    }
    if (difficulty && difficulty !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Apply filters for captions
    if (category && category !== 'all') {
      filteredCaptions = filteredCaptions.filter(c => c.category === category);
    }
    if (platform && platform !== 'all') {
      filteredCaptions = filteredCaptions.filter(c => c.platform === platform);
    }

    // Personalize content with user's referral code
    const personalizedTemplates = filteredTemplates.map(template => ({
      ...template,
      captionTemplate: template.captionTemplate.replace(/\{\{REFERRAL_CODE\}\}/g, referralCode),
      hashtags: template.hashtags.map(tag => tag.replace('{{REFERRAL_CODE}}', referralCode))
    }));

    const personalizedCaptions = filteredCaptions.map(caption => ({
      ...caption,
      content: caption.content.replace(/\{\{REFERRAL_CODE\}\}/g, referralCode),
      hashtags: caption.hashtags.map(tag => tag.replace('{{REFERRAL_CODE}}', referralCode))
    }));

    // Get user's template usage history
    const templateUsageHistory = await prisma.contentPost.groupBy({
      by: ['templateId'],
      where: { 
        userId: userId,
        templateId: { not: null }
      },
      _count: { templateId: true }
    });

    const usageMap = new Map(
      templateUsageHistory.map(item => [item.templateId, item._count.templateId])
    );

    // Add usage count to templates
    const templatesWithUsage = personalizedTemplates.map(template => ({
      ...template,
      usageCount: usageMap.get(template.id) || 0,
      isPopular: (usageMap.get(template.id) || 0) > 2
    }));

    // Return based on type requested
    if (type === 'captions') {
      return NextResponse.json({
        captions: personalizedCaptions,
        totalCount: personalizedCaptions.length,
        userInfo: {
          referralCode,
          contentStyle: user.contentStyle
        }
      });
    }

    if (type === 'templates') {
      return NextResponse.json({
        templates: templatesWithUsage,
        totalCount: templatesWithUsage.length,
        userInfo: {
          referralCode,
          contentStyle: user.contentStyle
        }
      });
    }

    // Return both if no specific type requested
    const responseData = {
      templates: templatesWithUsage,
      captions: personalizedCaptions,
      categories: {
        templates: [...new Set(contentTemplates.map(t => t.category))],
        captions: [...new Set(captionTemplates.map(c => c.category))]
      },
      platforms: [...new Set(contentTemplates.flatMap(t => t.platform))],
      difficulties: [...new Set(contentTemplates.map(t => t.difficulty))],
      userInfo: {
        referralCode,
        contentStyle: user.contentStyle
      },
      stats: {
        totalTemplates: contentTemplates.length,
        totalCaptions: captionTemplates.length,
        userTemplateUsage: templateUsageHistory.length
      }
    };

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error("CREATOR_TEMPLATES_API_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to fetch template data' }, { status: 500 });
  }
}

// POST - Request custom template or caption
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
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
        error: 'Type, title, and description are required' 
      }, { status: 400 });
    }

    // Validate user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isCreator: true, 
        username: true,
        email: true ,
        contentStyle:true
      }
    });

    if (!user?.isCreator) {
      return NextResponse.json({ error: 'Access denied. Creator account required.' }, { status: 403 });
    }

    // In a real application, this would create a request in the database
    // For now, we'll simulate storing the request
    const templateRequest = {
      id: `request_${Date.now()}`,
      userId: userId,
      userEmail: user.email,
      username: user.username,
      type: type,
      title: title,
      description: description,
      category: category || 'general',
      platform: platform || 'instagram',
      contentStyle: contentStyle || user.contentStyle,
      specificRequests: specificRequests || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // In production, you would:
    // 1. Save to database
    // 2. Send notification to content team
    // 3. Create workflow for approval/creation

    return NextResponse.json({
      message: 'Template request submitted successfully',
      request: templateRequest,
      estimatedCompletion: '2-3 business days'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("CREATOR_TEMPLATE_REQUEST_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to submit template request' }, { status: 500 });
  }
}