// types/next-auth.d.ts - Updated to include creator fields
import { type DefaultSession } from "next-auth";
import { Tier, Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      fullName: string;
      username: string;
      tier: Tier;
      role: Role;
      emailVerified: Date | null;
      subscriptionStartDate: Date | null;
      // NEW: Creator-specific fields
      isCreator: boolean;
      instagramHandle?: string;
      tiktokHandle?: string;
      whatsappNumber?: string;
      contentStyle?: string;
      followersCount?: string;
    } & DefaultSession['user']; 
  }

  interface User {
    id: string;
    email: string;
    fullName: string;
    username: string;
    tier: Tier;
    emailVerified: Date | null;
    subscriptionStartDate: Date | null;
    role: Role;
    // NEW: Creator-specific fields
    isCreator: boolean;
    instagramHandle?: string;
    tiktokHandle?: string;
    whatsappNumber?: string;
    contentStyle?: string;
    followersCount?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    username: string;
    tier: Tier;
    role: Role;
    emailVerified: Date | null;
    subscriptionStartDate: Date | null;
    lastUpdated?: number;
    // NEW: Creator-specific fields
    isCreator: boolean;
    instagramHandle?: string;
    tiktokHandle?: string;
    whatsappNumber?: string;
    contentStyle?: string;
    followersCount?: string;
  }
}