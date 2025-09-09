// app/api/creator/profile/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { clearUserCache } from '@/auth';

const UpdateCreatorProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  contentStyle: z.string().min(1, 'Content style is required.'),
  followersCount: z.string().min(1, 'Followers count is required.'),
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
        fullName: true,
        username: true,
        email: true,
        phone: true,
        instagramHandle: true,
        tiktokHandle: true,
        whatsappNumber: true,
        contentStyle: true,
        followersCount: true,
      }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("GET_CREATOR_PROFILE_ERROR: ", error);
    return NextResponse.json({ error: 'Creator profile not found or an error occurred.' }, { status: 404 });
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
    const validation = UpdateCreatorProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { fullName, username, phone, instagramHandle, tiktokHandle, whatsappNumber, contentStyle, followersCount } = validation.data;

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ error: "Username is already in use by another account." }, { status: 409 });
    }

    // Clean social media handles (remove @ if present)
    const cleanInstagramHandle = instagramHandle?.replace(/^@/, '') || null;
    const cleanTiktokHandle = tiktokHandle?.replace(/^@/, '') || null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName,
        username,
        phone,
        instagramHandle: cleanInstagramHandle,
        tiktokHandle: cleanTiktokHandle,
        whatsappNumber: whatsappNumber || null,
        contentStyle,
        followersCount,
      },
    });

    clearUserCache(session.user.id);
    return NextResponse.json({ message: "Creator profile updated successfully." });

  } catch (error) {
    console.error("UPDATE_CREATOR_PROFILE_ERROR:", error);
    return NextResponse.json({ error: 'Failed to update profile due to a server error.' }, { status: 500 });
  }
}