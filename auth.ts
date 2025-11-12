/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { Tier, Role } from "@prisma/client";
import { CachedUserData } from "./lib/types";

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

/* ------------------------------------------------------------------ */
/*  CACHE HELPERS                                                     */
/* ------------------------------------------------------------------ */
async function getCachedUser(userId: string) {
  const cached = userCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
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
      isCreator: true,
      instagramHandle: true,
      tiktokHandle: true,
      whatsappNumber: true,
      contentStyle: true,
      followersCount: true,
    },
  });

  if (user) {
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

/* ------------------------------------------------------------------ */
/*  HELPER – validate internal callback URLs                          */
/* ------------------------------------------------------------------ */
function isValidInternalUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url, "http://localhost");
    return (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/creator/dashboard")
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  NEXT-AUTH CONFIG                                                  */
/* ------------------------------------------------------------------ */
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  /* -------------------------------------------------------------- */
  /*  CALLBACKS                                                     */
  /* -------------------------------------------------------------- */
  callbacks: {
    /* ------------------- REDIRECT ------------------- */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow same-origin absolute URLs
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    /* ------------------- AUTHORIZED ------------------- */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role as Role | undefined;
      const isCreator = auth?.user?.isCreator as boolean | undefined;

      /* ------------------- ROUTE FLAGS ------------------- */
      const isOnAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isOnAdminLogin = nextUrl.pathname === "/admin/auth/login";
      const isOnAdminAccessDenied = nextUrl.pathname === "/admin/access-denied";

      const publicCreatorRoutes = [
        "/creator",
        "/creator/platform",
        "/creator/contact",
        "/creator/about",
        "/creator/membership",
        "/creator/auth/login",
        "/creator/auth/register",
        "/creator/auth/verify",
        "/creator/auth/check-your-email",
        "/creator/auth/access-denied",
      ];

      const isOnProtectedCreatorRoute =
        nextUrl.pathname.startsWith("/creator/") &&
        !publicCreatorRoutes.includes(nextUrl.pathname) &&
        !nextUrl.pathname.startsWith("/creator/auth/");

      const isOnCreatorAuthPage = nextUrl.pathname.startsWith("/creator/auth/");
      const isOnRegularDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnRegularAuthPage =
        nextUrl.pathname.startsWith("/auth/") &&
        !nextUrl.pathname.startsWith("/auth/tier-selection") &&
        !nextUrl.pathname.startsWith("/auth/verify");

      /* ------------------- ADMIN ------------------- */
      if (isOnAdminAccessDenied) {
        if (!isLoggedIn) return Response.redirect(new URL("/admin/auth/login", nextUrl));
        if (userRole === "ADMIN") return Response.redirect(new URL("/admin/overview", nextUrl));
        return true;
      }

      if (isOnAdminRoute && !isOnAdminLogin && !isOnAdminAccessDenied) {
        if (!isLoggedIn) return Response.redirect(new URL("/admin/auth/login", nextUrl));
        if (userRole !== "ADMIN") return Response.redirect(new URL("/admin/access-denied", nextUrl));
        return true;
      }

      if (isOnAdminLogin) {
        if (isLoggedIn && userRole === "ADMIN") return Response.redirect(new URL("/admin/overview", nextUrl));
        if (isLoggedIn && userRole === "USER") return Response.redirect(new URL("/admin/access-denied", nextUrl));
        return true;
      }

      /* ------------------- CREATOR PUBLIC ------------------- */
      if (publicCreatorRoutes.includes(nextUrl.pathname)) {
        if (isOnCreatorAuthPage && isLoggedIn && isCreator) {
          return Response.redirect(new URL("/creator/dashboard", nextUrl));
        }
        return true;
      }

      /* ------------------- CREATOR PROTECTED ------------------- */
      if (isOnProtectedCreatorRoute) {
        if (!isLoggedIn) return Response.redirect(new URL("/creator/auth/login", nextUrl));
        if (!isCreator) return Response.redirect(new URL("/creator/auth/access-denied", nextUrl));
        return true;
      }

      /* ------------------- REGULAR DASHBOARD ------------------- */
      if (isOnRegularDashboard) {
        if (!isLoggedIn) return Response.redirect(new URL("/auth/login", nextUrl));
        // FIXED: Allow creators to access regular dashboard (they can access both)
        // Creators who are also affiliates should be able to see both dashboards
        return true;
      }

      /* ------------------- REGULAR AUTH PAGES ------------------- */
      if (isLoggedIn && isOnRegularAuthPage) {
        const callbackUrl = nextUrl.searchParams.get("callbackUrl");
        
        // FIXED: Use callbackUrl or default to /dashboard (not creator dashboard)
        // This allows the login page to control where users go
        let redirectTo: string;
        
        if (callbackUrl && isValidInternalUrl(callbackUrl)) {
          redirectTo = callbackUrl;
        } else {
          // Default to regular dashboard even for creators
          // They can navigate to creator dashboard via the UI
          redirectTo = "/dashboard";
        }
        
        return Response.redirect(new URL(redirectTo, nextUrl));
      }

      /* ------------------- DEFAULT ------------------- */
      return true;
    },

    /* ------------------- JWT ------------------- */
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.fullName;
        token.tier = user.tier;
        token.subscriptionStartDate = user.subscriptionStartDate;
        token.username = user.username;
        token.emailVerified = user.emailVerified;
        token.role = user.role;
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
            token.isCreator = dbUser.isCreator;
            token.instagramHandle = dbUser.instagramHandle;
            token.tiktokHandle = dbUser.tiktokHandle;
            token.whatsappNumber = dbUser.whatsappNumber;
            token.contentStyle = dbUser.contentStyle;
            token.followersCount = dbUser.followersCount;
            token.lastUpdated = Date.now();
          }
        } catch (error) {
          console.error("JWT update error:", error);
        }
      }

      return token;
    },

    /* ------------------- SESSION ------------------- */
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

  /* -------------------------------------------------------------- */
  /*  PROVIDERS                                                     */
  /* -------------------------------------------------------------- */
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsed = z
            .object({
              email: z.string().email().toLowerCase().trim(),
              password: z.string().min(1, "Password is required"),
            })
            .safeParse(credentials);

          if (!parsed.success) return null;

          const { email, password } = parsed.data;

          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
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
              isCreator: true,
              instagramHandle: true,
              tiktokHandle: true,
              whatsappNumber: true,
              contentStyle: true,
              followersCount: true,
            },
          });

          if (!user || !user.emailVerified) return null;

          const match = await bcrypt.compare(password, user.password);
          if (!match) return null;

          const { password: _, ...safeUser } = user;
          return {
            ...safeUser,
            instagramHandle: safeUser.instagramHandle ?? undefined,
            tiktokHandle: safeUser.tiktokHandle ?? undefined,
            whatsappNumber: safeUser.whatsappNumber ?? undefined,
            contentStyle: safeUser.contentStyle ?? undefined,
            followersCount: safeUser.followersCount ?? undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});