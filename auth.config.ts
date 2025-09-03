// auth.config.ts - Simplified (authorization logic moved to auth.ts)
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',    
  },
  providers: [], 
} satisfies NextAuthConfig;