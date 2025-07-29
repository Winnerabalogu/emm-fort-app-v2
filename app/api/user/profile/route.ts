// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },      
      select: { fullName: true, username: true, email: true, phone: true }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("GET_PROFILE_ERROR: ", error);
    return NextResponse.json({ error: 'User not found or an error occurred.' }, { status: 404 });
  }
}
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();        
    const validation = UpdateProfileSchema.safeParse(body);

    if (!validation.success) {      
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }    
    const { fullName, username, phone } = validation.data;        
    const existingUser = await prisma.user.findUnique({
        where: { username: username },
    });

    if (existingUser && existingUser.id !== session.user.id) {        
        return NextResponse.json({ error: "Username is already in use by another account." }, { status: 409 }); 
    }
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName,
        username,
        phone,
      },
    });
    
    return NextResponse.json({ message: "Profile updated successfully." });

  } catch (error) {    
    console.error("UPDATE_PROFILE_ERROR:", error);
    return NextResponse.json({ error: 'Failed to update profile due to a server error.' }, { status: 500 });
  }
}