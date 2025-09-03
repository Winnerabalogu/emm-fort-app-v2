// app/api/creator/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface SearchResult {
  id: string;
  title: string;
  type: 'transaction' | 'content' | 'template' | 'page';
  url: string;
  description?: string;
  relevance: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
     const session = await auth();
    
    if (!session?.user || !session.user.isCreator) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Query too short'
      });
    }

    const userId = session.user.id;
    const results: SearchResult[] = [];

    // 1. Search transactions
    const transactionResults = await searchTransactions(userId, query);
    results.push(...transactionResults);

    // 2. Search user content posts
    const contentResults = await searchContentPosts(userId, query);
    results.push(...contentResults);

    // 3. Search content templates
    const templateResults = await searchContentTemplates(query);
    results.push(...templateResults);

    // 4. Search dashboard pages/sections
    const pageResults = await searchPages(query);
    results.push(...pageResults);

    // Sort by relevance and limit results
    const sortedResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: sortedResults,
      total: sortedResults.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function searchTransactions(userId: string, query: string): Promise<SearchResult[]> {
  try {
    const queryLower = query.toLowerCase();
    
    // Search user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        OR: [
          { type: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { amount: { equals: parseFloat(query) || undefined } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sourceUser: {
          select: { fullName: true, username: true }
        },
        contentPost: {
          select: { title: true }
        }
      }
    });

    return transactions.map(transaction => {
      let relevance = 0;
      let title = '';
      let description = '';

      // Calculate relevance based on match type
      if (transaction.type.toLowerCase().includes(queryLower)) {
        relevance += 3;
        title = `${transaction.type} - ₦${transaction.amount.toLocaleString()}`;
      }

      if (transaction.description?.toLowerCase().includes(queryLower)) {
        relevance += 2;
        title = title || `₦${transaction.amount.toLocaleString()} transaction`;
      }

      if (transaction.amount.toString().includes(query)) {
        relevance += 1;
        title = title || `₦${transaction.amount.toLocaleString()} transaction`;
      }

      // Build description
      const parts = [];
      parts.push(transaction.type);
      if (transaction.sourceUser) {
        parts.push(`from ${transaction.sourceUser.fullName || transaction.sourceUser.username}`);
      }
      if (transaction.contentPost) {
        parts.push(`for "${transaction.contentPost.title}"`);
      }
      parts.push(new Date(transaction.createdAt).toLocaleDateString());
      description = parts.join(' • ');

      return {
        id: transaction.id,
        title: title || `Transaction ₦${transaction.amount.toLocaleString()}`,
        type: 'transaction' as const,
        url: `/creator/dashboard/earnings?transaction=${transaction.id}`,
        description,
        relevance: relevance || 1
      };
    });
  } catch (error) {
    console.error('Error searching transactions:', error);
    return [];
  }
}

async function searchContentPosts(userId: string, query: string): Promise<SearchResult[]> {
  try {
    const queryLower = query.toLowerCase();
    
    // Search user's content posts
    const contentPosts = await prisma.contentPost.findMany({
      where: {
        userId: userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { platform: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { hashtags: { hasSome: [query.toLowerCase()] } }
        ]
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    });

    return contentPosts.map(post => {
      let relevance = 0;

      // Calculate relevance
      if (post.title.toLowerCase().includes(queryLower)) {
        relevance += 4;
      }
      if (post.description?.toLowerCase().includes(queryLower)) {
        relevance += 2;
      }
      if (post.platform.toLowerCase().includes(queryLower)) {
        relevance += 1;
      }
      if (post.type.toLowerCase().includes(queryLower)) {
        relevance += 2;
      }
      if (post.hashtags.some(tag => tag.toLowerCase().includes(queryLower))) {
        relevance += 3;
      }

      // Build description
      const parts = [];
      parts.push(`${post.platform} ${post.type}`);
      parts.push(`${post.views} views`);
      if (post.earnings > 0) {
        parts.push(`₦${post.earnings.toLocaleString()} earned`);
      }
      parts.push(post.status);

      return {
        id: post.id,
        title: post.title,
        type: 'content' as const,
        url: `/creator/dashboard/content?id=${post.id}`,
        description: parts.join(' • '),
        relevance: relevance || 1
      };
    });
  } catch (error) {
    console.error('Error searching content posts:', error);
    return [];
  }
}

async function searchContentTemplates(query: string): Promise<SearchResult[]> {
  try {
    const queryLower = query.toLowerCase();
    
    // Search content templates
    const templates = await prisma.contentTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
          { platform: { hasSome: [query.toLowerCase()] } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return templates.map(template => {
      let relevance = 0;

      // Calculate relevance
      if (template.title.toLowerCase().includes(queryLower)) {
        relevance += 4;
      }
      if (template.description.toLowerCase().includes(queryLower)) {
        relevance += 2;
      }
      if (template.category.toLowerCase().includes(queryLower)) {
        relevance += 3;
      }
      if (template.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        relevance += 3;
      }
      if (template.platform.some(platform => platform.toLowerCase().includes(queryLower))) {
        relevance += 1;
      }

      // Build description
      const parts = [];
      parts.push(`${template.platform.join(', ')} template`);
      parts.push(template.category);
      parts.push(`${template.difficulty} difficulty`);
      if (template.tags.length > 0) {
        parts.push(`Tags: ${template.tags.slice(0, 3).join(', ')}`);
      }

      return {
        id: template.id,
        title: template.title,
        type: 'template' as const,
        url: `/creator/dashboard/content?template=${template.id}`,
        description: parts.join(' • '),
        relevance: relevance || 1
      };
    });
  } catch (error) {
    console.error('Error searching content templates:', error);
    return [];
  }
}

async function searchPages(query: string): Promise<SearchResult[]> {
  // Static page/section search
  const pages = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      url: '/creator/dashboard',
      description: 'Overview of your creator performance and earnings',
      keywords: ['dashboard', 'overview', 'home', 'stats', 'summary']
    },
    {
      id: 'earnings',
      title: 'Earnings',
      url: '/creator/dashboard/earnings',
      description: 'Track your commissions, bonuses, and payouts',
      keywords: ['earnings', 'money', 'commission', 'bonus', 'payout', 'transactions']
    },
    {
      id: 'content',
      title: 'Content Hub',
      url: '/creator/dashboard/content',
      description: 'Manage your content templates and posts',
      keywords: ['content', 'templates', 'posts', 'social media', 'create']
    },
    {
      id: 'referrals',
      title: 'My Referrals',
      url: '/creator/dashboard/referrals',
      description: 'Manage your referral network and track performance',
      keywords: ['referrals', 'network', 'invite', 'code', 'friends']
    },
    {
      id: 'analytics',
      title: 'Analytics',
      url: '/creator/dashboard/analytics',
      description: 'View detailed analytics and performance metrics',
      keywords: ['analytics', 'metrics', 'performance', 'insights', 'data']
    },
    {
      id: 'settings',
      title: 'Settings',
      url: '/creator/dashboard/settings',
      description: 'Update your profile and account preferences',
      keywords: ['settings', 'profile', 'account', 'preferences', 'config']
    }
  ];

  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  pages.forEach(page => {
    let relevance = 0;

    // Check title match
    if (page.title.toLowerCase().includes(queryLower)) {
      relevance += 4;
    }

    // Check keywords match
    const keywordMatch = page.keywords.some(keyword => 
      keyword.includes(queryLower) || queryLower.includes(keyword)
    );
    if (keywordMatch) {
      relevance += 3;
    }

    // Check description match
    if (page.description.toLowerCase().includes(queryLower)) {
      relevance += 2;
    }

    if (relevance > 0) {
      results.push({
        id: page.id,
        title: page.title,
        type: 'page',
        url: page.url,
        description: page.description,
        relevance
      });
    }
  });

  return results;
};