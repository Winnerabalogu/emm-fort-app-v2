import { type DefaultSession } from "next-auth";
import { Tier } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      fullName: string;
      username: string;
      tier: Tier;
      emailVerified: Date | null;
      subscriptionStartDate: Date | null;
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
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    username: string;
    tier: Tier;
    emailVerified: Date | null;
    subscriptionStartDate: Date | null;
    lastUpdated?: number; 
  }
}
