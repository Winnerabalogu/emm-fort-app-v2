
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  return NextResponse.json({
    isLoggedIn: !!session?.user,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      username: session.user.username,
      role: session.user.role,
      isCreator: session.user.isCreator,
      tier: session.user.tier,
    } : null,
  });
}