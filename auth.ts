// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config'; 
import { Tier } from '@prisma/client';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig, 
  session: { strategy: "jwt" },
  callbacks: {    
   authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true; 
        return false; 
      } else if (isLoggedIn) {    
        if (nextUrl.pathname.startsWith('/auth')) {        
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }      
      return true;
    },
    // --- END MIDDLEWARE LOGIC ---

    async jwt({ token, user, trigger }) {      
      if (user) {
        token.id = user.id;
        token.name = user.fullName;
        token.tier = user.tier; 
        token.subscriptionStartDate = user.subscriptionStartDate;
        token.username = user.username;
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {          
          token.tier = dbUser.tier;
          token.subscriptionStartDate = dbUser.subscriptionStartDate;
           token.username = dbUser.username;
        }
      }
      return token;
    },
    
    session({ session, token }) {      
      if (token && session.user) {
        if (typeof token.id === 'string') session.user.id = token.id;
        if (token.tier) session.user.tier = token.tier as Tier;
        if (token.username) session.user.username = token.username as string;
        if (token.subscriptionStartDate) {
          session.user.subscriptionStartDate = new Date(token.subscriptionStartDate as string | Date);
        } else {
          session.user.subscriptionStartDate = null;
        }
      }
      return session;
    },
  },
  providers: [
    Credentials({      
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          });

          if (!user) return null; 
          
          if (!user.emailVerified) {
            console.log(`Login failed: Email not verified for ${email}`);
            return null; 
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {            
            return user;
          }
        }        
        return null;
      },
    }),
  ],
});