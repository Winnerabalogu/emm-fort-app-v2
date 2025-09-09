export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { clearUserCache } from '@/auth';

const ContentPreferencesSchema = z.object({
  preferredPlatforms: z.array(z.string()).optional(),
  contentTypes: z.array(z.string()).optional(),
  postingFrequency: z.string().optional(),
  niche: z.string().optional(),
  templatePreferences: z.array(z.string()).optional(),
  autoSuggestContent: z.boolean().optional(),
  enableAnalytics: z.boolean().optional(),
  showEarningsPublicly: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session?.user?.isCreator) {
    return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: {
        preferredPlatforms: true,
        contentTypes: true,
        postingFrequency: true,
        niche: true,
        templatePreferences: true,
        autoSuggestContent: true,
        enableAnalytics: true,
        showEarningsPublicly: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET_CREATOR_CONTENT_PREFERENCES_ERROR: ", error);
    return NextResponse.json({ error: 'Failed to load content preferences.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session?.user?.isCreator) {
    return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = ContentPreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedPreferences = validation.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updatedPreferences,
    });

    clearUserCache(session.user.id);
    return NextResponse.json({ message: "Content preferences updated successfully." });

  } catch (error) {
    console.error("UPDATE_CREATOR_CONTENT_PREFERENCES_ERROR:", error);
    return NextResponse.json({ error: 'Failed to update content preferences due to a server error.' }, { status: 500 });
  }
}