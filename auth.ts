/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { Tier, Role } from '@prisma/client'; 
import { CachedUserData } from './lib/types';

type ExtendedCachedUserData = CachedUserData & {
  role: Role;
};

const userCache = new Map<string, { data: ExtendedCachedUserData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

async function getCachedUser(userId: string) {
  const cached = userCache.get(userId);
  const now = Date.now();
    
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tier: true,
      subscriptionStartDate: true,
      username: true,
      fullName: true,
      emailVerified: true,
      role: true 
    }
  });
  
  if (user) {
    userCache.set(userId, { data: user, timestamp: now });
  }
  
  return user;
}

export function clearUserCache(userId: string) {
  userCache.delete(userId);
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig, 
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {    
    authorized({ auth, request: { nextUrl } }) {
  const isLoggedIn = !!auth?.user;
  const userRole = auth?.user?.role;
  const isOnAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isOnAdminLogin = nextUrl.pathname === '/admin/auth/login';
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  
  // Admin route protection
  if (isOnAdminRoute && !isOnAdminLogin) {
    if (!isLoggedIn || userRole !== 'ADMIN') {
      return false; // Will redirect to /admin/login via pages config
    }
    return true;
  }
  
  // If admin trying to access admin login when already logged in
  if (isOnAdminLogin && isLoggedIn && userRole === 'ADMIN') {
    return Response.redirect(new URL('/admin/overview', nextUrl));
  }
  
  // Your existing logic for regular routes...
  if (isOnDashboard) {
    if (isLoggedIn) return true; 
    return false; 
  }
  
  // Rest of your existing authorized logic...
  if (isLoggedIn) {
    const allowedAuthPagesWhenLoggedIn = ['/auth/tier-selection'];
    if (allowedAuthPagesWhenLoggedIn.includes(nextUrl.pathname)) {
      return true;
    }
    if (nextUrl.pathname.startsWith('/auth')) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
  }
  
  return true;
},
    async jwt({ token, user, trigger }) {      
      if (user) {
        token.id = user.id;
        token.name = user.fullName;
        token.tier = user.tier;
        token.subscriptionStartDate = user.subscriptionStartDate;
        token.username = user.username;
        token.emailVerified = user.emailVerified;
        token.role = user.role; 
        token.lastUpdated = Date.now();
      }            
      if (trigger === "update" && token.id) {
        clearUserCache(token.id as string); 
        try {
          const dbUser = await getCachedUser(token.id as string);
          if (dbUser) {          
            token.tier = dbUser.tier;
            token.subscriptionStartDate = dbUser.subscriptionStartDate;
            token.username = dbUser.username;
            token.name = dbUser.fullName;
            token.emailVerified = dbUser.emailVerified;
            token.role = dbUser.role;
            token.lastUpdated = Date.now();
          }
        } catch (error) {
          console.error('JWT update error:', error);          
        }
      }
      
      return token;
    },
    
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as Tier;
        session.user.username = token.username as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.subscriptionStartDate = token.subscriptionStartDate 
          ? new Date(token.subscriptionStartDate as string | Date)
          : null;
        session.user.role = token.role as Role; 
      }
      return session;
    },
  },
  providers: [
    Credentials({      
      async authorize(credentials) {
        try {
          const parsedCredentials = z.object({ 
            email: z.string().email().toLowerCase().trim(), 
            password: z.string().min(1, "Password is required")
          }).safeParse(credentials);

          if (!parsedCredentials.success) return null;

          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: {
              id: true,
              email: true,
              password: true,
              fullName: true,
              username: true,
              tier: true,
              subscriptionStartDate: true,
              emailVerified: true,
              role: true, 
            }
          });

          if (!user || !user.emailVerified) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            const { password: _, ...userWithoutPassword } = user;            
            return userWithoutPassword;
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
        
        return null;
      },
    }),
  ],    
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },    
  events: {
    // Event logging remains the same
  }
});