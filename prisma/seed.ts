// prisma/seed.ts
import { PrismaClient, Tier, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("Clearing database...");
  
  // Clear in dependency order
  await prisma.contentAnalytics.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.contentPost.deleteMany();
  await prisma.templateRequest.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.withdrawalDetails.deleteMany();
  await prisma.saveRequest.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.emailSubscription.deleteMany();
  await prisma.platformSettings.deleteMany();
  
  // Clear user relationships first
  await prisma.user.updateMany({
    where: { uplinerId: { not: null } },
    data: { uplinerId: null }
  });
  await prisma.user.deleteMany();
  await prisma.contentTemplate.deleteMany();
  
  console.log("Database cleared.");
}

async function main() {
  console.log("Starting seeding process...");
  await clearDatabase();

  // --- Create Admin User ---
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Platform Admin',
      username: 'admin',
      email: 'admin@emmfortgroup.com',
      phone: '0000000000',
      password: adminPassword,
      emailVerified: new Date(),
      tier: Tier.GOLD,
      role: Role.ADMIN,
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
    },
  });
  console.log("Admin user created:", adminUser.username);

  // --- Create Platform Settings ---
  await prisma.platformSettings.upsert({
    where: { section: 'general' },
    update: {},
    create: {
      id: 'general-default',
      section: 'general',
      data: {
        siteName: "EmmFort Platform",
        siteUrl: "https://affiliate.emmfortgroup.com",
        supportEmail: "support@emmfortgroup.com",
        maintenanceMode: false,
        registrationEnabled: true,
        maxUplineDepth: 5,
        defaultTier: "BRONZE"
      },
      updatedBy: adminUser.id,
    },
  });

  await prisma.platformSettings.upsert({
    where: { section: 'commission' },
    update: {},
    create: {
      id: 'commission-default',
      section: 'commission',
      data: {
        commissionRates: { BRONZE: 5.0, SILVER: 10.0, GOLD: 15.0, PLATINUM: 20.0 },
        minWithdrawalAmount: 5000.0,
        withdrawalFee: 100.0,
        withdrawalProcessingDays: 3
      },
      updatedBy: adminUser.id,
    },
  });

  await prisma.platformSettings.upsert({
    where: { section: 'notifications' },
    update: {},
    create: {
      id: 'notifications-default',
      section: 'notifications',
      data: {
        emailNotifications: true,
        smsNotifications: false,
        withdrawalNotifications: true,
        commissionNotifications: true,
        systemNotifications: true
      },
      updatedBy: adminUser.id,
    },
  });

  await prisma.platformSettings.upsert({
    where: { section: 'payment' },
    update: {},
    create: {
      id: 'payment-default',
      section: 'payment',
      data: {
        supportedMethods: ["paystack"],
        paymentGateways: {
          paystack: { enabled: false, publicKey: "", secretKey: "" },
          flutterwave: { enabled: false, publicKey: "", secretKey: "" }
        }
      },
      updatedBy: adminUser.id,
    },
  });

  await prisma.platformSettings.upsert({
    where: { section: 'security' },
    update: {},
    create: {
      id: 'security-default',
      section: 'security',
      data: {
        passwordMinLength: 8,
        requireEmailVerification: true,
        maxLoginAttempts: 5,
        sessionTimeout: 1440,
        twoFactorAuth: false
      },
      updatedBy: adminUser.id,
    },
  });

  console.log("Platform settings created/updated.");

  // --- Create Master Upliner User (GOLD Tier) ---
  const uplinerPassword = await bcrypt.hash('password123', 10);
  const upliner = await prisma.user.create({
    data: {
      fullName: 'Master Upliner',
      username: 'master_upliner',
      email: 'upliner@example.com',
      phone: '1112223333',
      password: uplinerPassword,
      emailVerified: new Date(),
      tier: Tier.GOLD,
      role: Role.USER,
      isCreator: true,
      instagramHandle: '@master_upliner',
      contentStyle: 'Grocery Hauls & Unboxing',
      followersCount: '1K-10K followers',
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });
  console.log("Upliner user created:", upliner.username);

  // --- Create Downline Users ---
  const downline1Password = await bcrypt.hash('password123', 10);
  const downline1 = await prisma.user.create({
    data: {
      fullName: 'Silver Downline',
      username: 'silver_downline',
      email: 'downline1@example.com',
      phone: '4445556666',
      password: downline1Password,
      emailVerified: new Date(),
      tier: Tier.SILVER,
      role: Role.USER,
      isCreator: true,
      instagramHandle: '@silver_creator',
      contentStyle: 'Lifestyle & Food Content',
      followersCount: '500-1K followers',
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id,
    },
  });
  console.log("Downline user 1 created:", downline1.username);

  const downline2Password = await bcrypt.hash('password123', 10);
  const downline2 = await prisma.user.create({
    data: {
      fullName: 'Bronze Downline',
      username: 'bronze_downline',
      email: 'downline2@example.com',
      phone: '7778889999',
      password: downline2Password,
      emailVerified: new Date(),
      tier: Tier.BRONZE,
      role: Role.USER,
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id,
    },
  });
  console.log("Downline user 2 created:", downline2.username);

  // --- Create Content Templates ---
   const contentTemplates = await prisma.contentTemplate.createMany({
    data: [
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
        hashtags: ['#MealPrep', '#HealthyEating', '#EMMFORT', '#MASTER123']
      },
       {
        id: 'template_3',
        title: 'Fresh Produce Flat Lay',
        category: 'photography',
        type: 'image',
        platform: ['instagram', 'facebook'],
        description: 'Beautiful styled photography showcasing fresh produce from EMM-FORT in an aesthetically pleasing layout.',
        thumbnailUrl: '/templates/produce-flatlay.jpg',
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
    
    ]
  });
  console.log("Sample content posts created.");


  // --- Create User Preferences ---
  await prisma.userPreference.createMany({
    data: [
      {
        userId: upliner.id,
        key: 'templateOrder',
        value: JSON.stringify([
          { id: 'template_2', order: 0 },
          { id: 'template_1', order: 1 },
          { id: 'template_3', order: 2 }
        ])
      },
      {
        userId: upliner.id,
        key: 'dashboardLayout',
        value: JSON.stringify({
          sidebarCollapsed: false,
          theme: 'dark',
          gridView: 'card'
        })
      },
      {
        userId: downline1.id,
        key: 'contentFilters',
        value: JSON.stringify({
          platform: 'instagram',
          difficulty: 'easy',
          engagement: 'high'
        })
      },
      {
        userId: downline1.id,
        key: 'templateOrder',
        value: JSON.stringify([
          { id: 'template_1', order: 0 },
          { id: 'template_3', order: 1 },
          { id: 'template_4', order: 2 }
        ])
      }
    ]
  });
  console.log("User preferences created.");

  // --- Create Sample Template Requests ---
  await prisma.templateRequest.createMany({
    data: [
      {
        userId: downline1.id,
        title: 'Custom Workout + Nutrition Template',
        description: 'I want to create content that shows how I fuel my workouts with EMM-FORT fresh produce. Something that combines fitness and nutrition.',
        type: 'template',
        category: 'fitness',
        platform: 'instagram',
        contentStyle: 'Fitness & Nutrition',
        specificRequests: 'Show pre-workout snacks and post-workout meals using EMM-FORT ingredients',
        status: 'pending'
      },
      {
        userId: upliner.id,
        title: 'Holiday Special Caption',
        description: 'Need a festive caption template for Christmas grocery hauls',
        type: 'caption',
        category: 'seasonal',
        platform: 'instagram',
        status: 'completed',
        adminNotes: 'Created holiday-themed caption with seasonal hashtags',
        completedAt: new Date('2024-01-10')
      }
    ]
  });
  console.log("Sample template requests created.");

  // --- Create Sample Contact Requests ---
  await prisma.contactRequest.createMany({
    data: [
      {
        fullName: 'John Smith',
        email: 'john@example.com',
        phone: '+2348123456789',
        subject: 'Question about Creator Program',
        message: 'Hi, I am interested in joining the creator program. Can you provide more details about the requirements?',
        source: 'contact_form',
        status: 'NEW',
        priority: 'NORMAL'
      },
      {
        fullName: 'Sarah Johnson',
        email: 'sarah@example.com',
        subject: 'Partnership Inquiry',
        message: 'I run a food blog with 50K followers and would like to partner with EMM-FORT.',
        source: 'creator_page',
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      }
    ]
  });
  console.log("Sample contact requests created.");

  // --- Create Sample Email Subscriptions ---
  await prisma.emailSubscription.createMany({
    data: [
      {
        email: 'subscriber1@example.com',
        source: 'homepage_signup',
        metadata: { utm_source: 'google', utm_medium: 'cpc' }
      },
      {
        email: 'subscriber2@example.com',
        source: 'creator_page',
        metadata: { referrer: 'instagram', interest: 'creator_program' }
      },
      {
        email: 'subscriber3@example.com',
        source: 'blog_newsletter',
        metadata: { blog_post: 'healthy_eating_tips' }
      }
    ]
  });
  console.log("Sample email subscriptions created.");

  // --- Create Sample Withdrawal Details ---
  await prisma.withdrawalDetails.create({
    data: {
      userId: upliner.id,
      bankName: 'First Bank of Nigeria',
      firstName: 'Master',
      lastName: 'Upliner',
      accountNumber: '1234567890'
    }
  });
  console.log("Withdrawal details created for upliner.");

  // --- Create Sample Content Analytics ---
  const recentPost = await prisma.contentPost.findFirst({
    where: { userId: upliner.id, status: 'PUBLISHED' }
  });

  if (recentPost) {
    await prisma.contentAnalytics.createMany({
      data: [
        {
          contentPostId: recentPost.id,
          date: new Date('2024-01-15'),
          views: 500,
          likes: 45,
          comments: 8,
          shares: 3,
          earnings: 200.00,
          impressions: 2500,
          reach: 1800,
          engagement: 12.5
        },
        {
          contentPostId: recentPost.id,
          date: new Date('2024-01-16'),
          views: 1200,
          likes: 89,
          comments: 15,
          shares: 7,
          earnings: 450.00,
          impressions: 5200,
          reach: 3400,
          engagement: 15.2
        }
      ]
    });
    console.log("Sample content analytics created.");
  }
  await prisma.transaction.createMany({
    data: [
      { 
        type: 'COMMISSION', 
        amount: 2500.00, 
        status: 'COMPLETED', 
        userId: upliner.id, 
        sourceUserId: downline1.id,
        description: 'Commission from Silver Downline subscription'
      },
      { 
        type: 'COMMISSION', 
        amount: 1500.00, 
        status: 'COMPLETED', 
        userId: upliner.id, 
        sourceUserId: downline1.id,
        description: 'Commission from referral bonus'
      },
      { 
        type: 'COMMISSION', 
        amount: 1000.00, 
        status: 'COMPLETED', 
        userId: upliner.id, 
        sourceUserId: downline2.id,
        description: 'Commission from Bronze Downline subscription'
      },
      { 
        type: 'BONUS', 
        amount: 5000.00, 
        status: 'COMPLETED', 
        userId: upliner.id,
        description: 'Monthly performance bonus'
      },
      { 
        type: 'WITHDRAWAL', 
        amount: 3000.00, 
        status: 'COMPLETED', 
        userId: upliner.id,
        description: 'Withdrawal to bank account'
      },
    ],
  });
  console.log("Transactions created for upliner.");

  // --- Create Sample Content Posts ---
  await prisma.contentPost.createMany({
    data: [
      {
        userId: upliner.id,
        templateId: 'template_1',
        title: 'My Weekly Grocery Haul',
        platform: 'instagram',
        type: 'reel',
        content: "Just got my @emmfort delivery and I'm obsessed! The quality is absolutely incredible. Use my code MASTER123 for amazing deals! #EMMFORT #FreshGroceries #MASTER123",
        status: 'PUBLISHED',
        views: 2543,
        likes: 156,
        comments: 23,
        shares: 12,
        earnings: 850.00,
        publishedAt: new Date('2024-01-15'),
        hashtags: ['#EMMFORT', '#FreshGroceries', '#MASTER123', '#GroceryHaul']
      },
      {
        userId: upliner.id,
        templateId: 'template_2',
        title: 'Sunday Meal Prep Session',
        platform: 'tiktok',
        type: 'video',
        content: "Sunday meal prep done! ✅ Using fresh ingredients from @emmfort makes such a difference. Use MASTER123 for your grocery delivery! #MealPrep #HealthyEating #EMMFORT #MASTER123",
        status: 'PUBLISHED',
        views: 8965,
        likes: 423,
        comments: 67,
        shares: 89,
        earnings: 1200.00,
        publishedAt: new Date('2024-01-18'),
        hashtags: ['#MealPrep','HealthyEating', '#EMMFORT', '#SundayPrep', '#HealthyLifestyle'],       
      },
        {
        userId: downline1.id,
        templateId: 'template_1',
        title: 'Unboxing Fresh Produce',
        platform: 'instagram',
        type: 'story',
        content: "Look at this gorgeous fresh produce from @emmfort! Use my code SILVER456 to get premium groceries delivered. #FreshProduce #EMMFORT #SILVER456",
        status: 'PUBLISHED',
        views: 1234,
        likes: 78,
        comments: 15,
        shares: 5,
        earnings: 320.00,
        publishedAt: new Date('2024-01-20'),
        hashtags: ['#FreshProduce', '#EMMFORT', '#SILVER456', '#HealthyChoices']
      },
      {
        userId: downline1.id,
        templateId: 'template_3',
        title: 'Beautiful Produce Flat Lay',
        platform: 'instagram',
        type: 'post',
        content: "Nourishing my body with the freshest produce from @emmfort! Quality ingredients make all the difference. Use SILVER456 for premium quality delivered fresh. #HealthyLiving #EMMFORT #SILVER456",
        status: 'DRAFT',
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        earnings: 0.00,
        hashtags: ['#HealthyLiving', '#WellnessJourney', '#EMMFORT', '#SILVER456']
      }
       ]
  });
  console.log(`Created ${contentTemplates.count} content templates.`);
    await prisma.contentTemplate.createMany({
    data: [
     
    ]
  });
  console.log(`Created ${contentTemplates.count} content templates.`);

  console.log("\n=== SEEDING COMPLETED ===");
  console.log("Users created:");
  console.log(`- Admin: admin@emmfortgroup.com (password: AdminPassword123!)`);
  console.log(`- Master Upliner (Creator): upliner@example.com (password: password123)`);
  console.log(`- Silver Downline (Creator): downline1@example.com (password: password123)`);
  console.log(`- Bronze Downline: downline2@example.com (password: password123)`);
  console.log("\nContent created:");
  console.log(`- 5 content templates`);
  console.log(`- 4 sample content posts`);
  console.log(`- 4 user preferences`);
  console.log(`- 2 template requests`);
  console.log(`- 2 contact requests`);
  console.log(`- 3 email subscriptions`);
  console.log(`- 1 withdrawal details record`);
  console.log(`- Sample analytics data`);
}

main()
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding finished successfully.");
    await prisma.$disconnect();
  });