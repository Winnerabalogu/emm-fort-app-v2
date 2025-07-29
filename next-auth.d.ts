import { type DefaultSession } from "next-auth"
import { Tier } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: Tier;
      subscriptionStartDate: Date | null;
      username: string; 
    } & DefaultSession['user']; 
  }
 
  interface User { 
    id: string;
    email: string;
    fullName: string;
    username: string; 
    tier: Tier;
    subscriptionStartDate: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    tier: Tier;
    subscriptionStartDate: Date | null;
    username: string;
  }
}
