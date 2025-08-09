/* eslint-disable @typescript-eslint/no-unused-vars */

// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config'; 
import { Tier } from '@prisma/client';
import { CachedUserData } from './lib/types';

const userCache = new Map<string, { data: CachedUserData; timestamp: number }>();
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
      emailVerified: true
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
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

  if (isOnDashboard) {
    if (isLoggedIn) return true; 
    return false; 
  } else if (isLoggedIn) {        
    const allowedAuthPagesWhenLoggedIn = [
      '/auth/tier-selection',
      // Add future onboarding pages here as needed
      // '/auth/setup-profile',
      // '/auth/welcome',
    ];        
    if (allowedAuthPagesWhenLoggedIn.includes(nextUrl.pathname)) {
      return true;
    }
    // Redirect away from other auth pages (login, register, etc.)
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
        token.lastUpdated = Date.now();
      }      
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await getCachedUser(token.id as string);
          if (dbUser) {          
            token.tier = dbUser.tier;
            token.subscriptionStartDate = dbUser.subscriptionStartDate;
            token.username = dbUser.username;
            token.name = dbUser.fullName;
            token.emailVerified = dbUser.emailVerified;
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
      }
      return session;
    },
  },
  providers: [
    Credentials({      
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({ 
              email: z.string().email().toLowerCase().trim(), 
              password: z.string().min(1, "Password is required")
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            console.log('Invalid credentials format:', parsedCredentials.error.issues);
            return null;
          }

          const { email, password } = parsedCredentials.data;                  
          const user = await prisma.user.findFirst({
            where: { 
              email: { equals: email, mode: 'insensitive' } 
            },
            select: {
              id: true,
              email: true,
              password: true,
              fullName: true,
              username: true,
              tier: true,
              subscriptionStartDate: true,
              emailVerified: true,              
            }
          });

          if (!user) {
            console.log(`Login failed: User not found for ${email}`);
            return null; 
          }
          
          if (!user.emailVerified) {
            console.log(`Login failed: Email not verified for ${email}`);
            return null; 
          }          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {            
            const { password: _, ...userWithoutPassword } = user;                        
            userCache.set(user.id, { 
              data: userWithoutPassword, 
              timestamp: Date.now() 
            });
            
            return userWithoutPassword;
          } else {
            console.log(`Login failed: Invalid password for ${email}`);
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
 async signIn({ user }) {
    console.log(`User signed in: ${user.email}`);
  },
  async signOut(message) {      
      if ("token" in message && message.token) {
        console.log("Signed out user ID:", message.token.id);
      }
  },
}
});