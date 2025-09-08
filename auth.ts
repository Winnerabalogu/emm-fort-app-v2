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
  isCreator: boolean;
  instagramHandle?: string | null;
  tiktokHandle?: string | null;
  whatsappNumber?: string | null;
  contentStyle?: string | null;
  followersCount?: string | null;
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
      role: true,
      // Creator fields
      isCreator: true,
      instagramHandle: true,
      tiktokHandle: true,
      whatsappNumber: true,
      contentStyle: true,
      followersCount: true
    }
  });
  
  if (user) {
    // Normalize null → undefined
    const normalizedUser: ExtendedCachedUserData = {
      ...user,
      instagramHandle: user.instagramHandle ?? undefined,
      tiktokHandle: user.tiktokHandle ?? undefined,
      whatsappNumber: user.whatsappNumber ?? undefined,
      contentStyle: user.contentStyle ?? undefined,
      followersCount: user.followersCount ?? undefined,
    };

    userCache.set(userId, { data: normalizedUser, timestamp: now });
    return normalizedUser;
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
    // Authorization logic - moved back from auth.config.ts to prevent conflicts
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isCreator = auth?.user?.isCreator;
      
     
      
      // Route analysis
      const isOnAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isOnAdminLogin = nextUrl.pathname === '/admin/auth/login';
      const isOnAdminAccessDenied = nextUrl.pathname === '/admin/access-denied';
      
      // Define public creator routes (no auth required)
      const publicCreatorRoutes = [
        '/creator', 
        '/creator/platform', 
        '/creator/contact', 
        '/creator/about', 
        '/creator/membership', 
        '/creator/auth/login',
        '/creator/auth/register',
        '/creator/auth/verify',
        '/creator/auth/check-your-email',
        '/creator/auth/access-denied'
      ];
      
      // Define protected creator routes (auth required)
      const isOnProtectedCreatorRoute = nextUrl.pathname.startsWith('/creator/') && 
        !publicCreatorRoutes.includes(nextUrl.pathname);
      
      const isOnCreatorLogin = nextUrl.pathname === '/creator/auth/login';
      const isOnCreatorRegister = nextUrl.pathname === '/creator/auth/register';
      const isOnRegularDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuthRoute = nextUrl.pathname.startsWith('/auth');

      // Admin route protection
      if (isOnAdminAccessDenied) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/admin/auth/login', nextUrl));
        }
        if (userRole === 'ADMIN') {
          return Response.redirect(new URL('/admin/overview', nextUrl));
        }
        return true; 
      }            
      
      if (isOnAdminRoute && !isOnAdminLogin && !isOnAdminAccessDenied) {
        if (!isLoggedIn) {          
          return Response.redirect(new URL('/admin/auth/login', nextUrl));
        }
        if (userRole !== 'ADMIN') {          
          return Response.redirect(new URL('/admin/access-denied', nextUrl));
        }
        return true; 
      }            
      
      if (isOnAdminLogin) {
        if (isLoggedIn && userRole === 'ADMIN') {          
          return Response.redirect(new URL('/admin/overview', nextUrl));
        }
        if (isLoggedIn && userRole === 'USER') {          
          return Response.redirect(new URL('/admin/access-denied', nextUrl));
        }
        return true; 
      }

      // Allow public creator routes (including landing page)
      if (publicCreatorRoutes.includes(nextUrl.pathname)) {
        // If already logged in as creator and trying to access auth pages, redirect to dashboard
        if ((isOnCreatorLogin || isOnCreatorRegister) && isLoggedIn && isCreator) {
         
          return Response.redirect(new URL('/creator/dashboard', nextUrl));
        }
        return true; // Allow access to public creator routes
      }

      // Protected creator routes - require authentication and creator status
      if (isOnProtectedCreatorRoute) {
     
        // Must be logged in
        if (!isLoggedIn) {        
          return Response.redirect(new URL('/creator/auth/login', nextUrl));
        }
        // Must be a creator
        if (!isCreator) {         
          return Response.redirect(new URL('/creator/auth/access-denied', nextUrl));
        }     
        return true;
      }

      // Regular dashboard protection
      if (isOnRegularDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/auth/login', nextUrl));
        }
        // Redirect creators to their dashboard
        if (isCreator) {
          return Response.redirect(new URL('/creator/dashboard', nextUrl));
        }
        return true; 
      }
      
      // Handle logged-in users accessing auth routes
      if (isLoggedIn && isOnAuthRoute) {
        const allowedAuthPagesWhenLoggedIn = ['/auth/tier-selection', '/auth/verify'];
        if (allowedAuthPagesWhenLoggedIn.includes(nextUrl.pathname)) {
          return true;
        }
        if ((isOnCreatorLogin || isOnCreatorRegister) && isLoggedIn && isCreator) {       
        return Response.redirect(new URL('/creator/dashboard', nextUrl));
      }
        // Redirect based on user type
        if (isCreator) {
          return Response.redirect(new URL('/creator/dashboard', nextUrl));
        } else {
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
        // Creator fields
        token.isCreator = user.isCreator;
        token.instagramHandle = user.instagramHandle;
        token.tiktokHandle = user.tiktokHandle;
        token.whatsappNumber = user.whatsappNumber;
        token.contentStyle = user.contentStyle;
        token.followersCount = user.followersCount;
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
            // Creator fields
            token.isCreator = dbUser.isCreator;
            token.instagramHandle = dbUser.instagramHandle;
            token.tiktokHandle = dbUser.tiktokHandle;
            token.whatsappNumber = dbUser.whatsappNumber;
            token.contentStyle = dbUser.contentStyle;
            token.followersCount = dbUser.followersCount;
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
        // Creator fields
        session.user.isCreator = token.isCreator as boolean;
        session.user.instagramHandle = token.instagramHandle as string | undefined;
        session.user.tiktokHandle = token.tiktokHandle as string | undefined;
        session.user.whatsappNumber = token.whatsappNumber as string | undefined;
        session.user.contentStyle = token.contentStyle as string | undefined;
        session.user.followersCount = token.followersCount as string | undefined;
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
              // Creator fields
              isCreator: true,
              instagramHandle: true,
              tiktokHandle: true,
              whatsappNumber: true,
              contentStyle: true,
              followersCount: true
            }
          });

          if (!user || !user.emailVerified) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            const { password: _, ...userWithoutPassword } = user;
            return {
              ...userWithoutPassword,
              instagramHandle: user.instagramHandle ?? undefined,
              tiktokHandle: user.tiktokHandle ?? undefined,
              whatsappNumber: user.whatsappNumber ?? undefined,
              contentStyle: user.contentStyle ?? undefined,
              followersCount: user.followersCount ?? undefined,
            };
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
    // Event logging remains the same - add your event handlers here if needed
  }
});