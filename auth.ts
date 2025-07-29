import { type Session, User } from "next-auth"
import  NextAuth from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { Tier } from '@prisma/client';


export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  
  providers: [
    Credentials({      
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);

        if (parsed.success) {
          const { email, password } = parsed.data;
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          });

          if (!user || !user.emailVerified) return null; 

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }        
        return null;
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks, // Spread the existing callbacks from config
    
    async jwt({ 
      token, 
      user, 
      trigger 
    }: { 
      token: JWT; 
      user?: User; 
      trigger?: string 
    }): Promise<JWT> {    
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
    
    async session({ 
      session, 
      token 
    }: { 
      session: Session; 
      token: JWT 
    }): Promise<Session> {    
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
});