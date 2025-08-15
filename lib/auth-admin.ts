import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { User } from 'next-auth';
import { ZodError } from 'zod';

export type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

export type AdminApiHandler = (
  req: NextRequest,
  context: RouteContext
) => Promise<NextResponse>;

const adminSessionCache = new Map<string, { isAdmin: boolean; user: User; timestamp: number }>();
const ADMIN_CACHE_TTL = 2 * 60 * 1000; 

const adminRateLimits = new Map<string, { count: number; resetTime: number }>();
const ADMIN_RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

const adminAuditLog = new Map<string, Array<{ action: string; timestamp: number; ip?: string }>>();
const MAX_AUDIT_ENTRIES = 100;

async function getCachedAdminSession(sessionId?: string) {
  if (!sessionId) return null;
  const cached = adminSessionCache.get(sessionId);
  if (cached && Date.now() - cached.timestamp < ADMIN_CACHE_TTL) {
    return cached;
  }

  try {
    const session = await auth();
    if (session?.user?.id && session.user.role === 'ADMIN') {
      const sessionData = {
        isAdmin: true,
        user: session.user,
        timestamp: Date.now()
      };
      adminSessionCache.set(sessionId, sessionData);
      return sessionData;
    }
  } catch (error) {
    console.error('Admin session cache error:', error);
  }
  return null;
}

function checkAdminRateLimit(adminId: string, ip?: string) {
  const now = Date.now();
  const key = `admin:${adminId}:${ip || 'unknown'}`;
  const current = adminRateLimits.get(key);

  if (!current || now > current.resetTime) {
    adminRateLimits.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (current.count >= ADMIN_RATE_LIMIT) {
    return false;
  }

  current.count++;
  return true;
}

function logAdminActivity(adminId: string, action: string, ip?: string) {
  const logs = adminAuditLog.get(adminId) || [];
  logs.push({ action, timestamp: Date.now(), ip });
  if (logs.length > MAX_AUDIT_ENTRIES) {
    logs.splice(0, logs.length - MAX_AUDIT_ENTRIES);
  }
  adminAuditLog.set(adminId, logs);
}

/**
 * withAdmin ensures that:
 * - Admin authentication is checked
 * - Rate limiting is applied
 * - Compatible with Next.js 15 route handler types
 */
export function withAdmin(
  handler: (req: NextRequest, admin: User, context: RouteContext) => Promise<NextResponse>
): AdminApiHandler {
  return async (req: NextRequest, context: RouteContext) => {
    const startTime = Date.now();
    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    try {
      const sessionToken =
        req.cookies.get('authjs.session-token')?.value ||
        req.cookies.get('__Secure-authjs.session-token')?.value;

      if (!sessionToken) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: No session token found.' },
          { status: 401 }
        );
      }

      const cachedSession = await getCachedAdminSession(sessionToken);

      if (!cachedSession) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or expired admin session.' },
          { status: 401 }
        );
      }

      if (!cachedSession.isAdmin) {
        logAdminActivity(
          cachedSession.user.id,
          `UNAUTHORIZED_ACCESS_ATTEMPT:${req.method}:${req.nextUrl.pathname}`,
          clientIp
        );
        return NextResponse.json(
          { success: false, error: 'Forbidden: Admin access required.' },
          { status: 403 }
        );
      }

      if (!checkAdminRateLimit(cachedSession.user.id, clientIp)) {
        logAdminActivity(
          cachedSession.user.id,
          `RATE_LIMIT_EXCEEDED:${req.method}:${req.nextUrl.pathname}`,
          clientIp
        );
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      logAdminActivity(
        cachedSession.user.id,
        `${req.method}:${req.nextUrl.pathname}`,
        clientIp
      );

      // Call the handler with admin user and context
      const response = await handler(req, cachedSession.user, context);

      const duration = Date.now() - startTime;
      if (duration > 5000) {
        console.warn(
          `[Admin API Slow Query] ${req.method} ${req.nextUrl.pathname} took ${duration}ms`
        );
      }

      response.headers.set('X-Admin-Request', 'true');
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[Admin API Error] ${req.method} ${req.nextUrl.pathname} (${duration}ms):`,
        error
      );

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input data.',
            details: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'An internal server error occurred.' },
        { status: 500 }
      );
    }
  };
}

// Export utility functions for monitoring
export function getAdminStats() {
  return {
    activeSessions: adminSessionCache.size,
    rateLimitEntries: adminRateLimits.size,
    auditLogEntries: adminAuditLog.size
  };
}

export function clearAdminCache(adminId?: string) {
  if (adminId) {
    // Clear specific admin's cache
    Array.from(adminSessionCache.keys())
      .filter(key => adminSessionCache.get(key)?.user.id === adminId)
      .forEach(key => adminSessionCache.delete(key));
    
    // Clear rate limits for specific admin
    Array.from(adminRateLimits.keys())
      .filter(key => key.includes(`admin:${adminId}:`))
      .forEach(key => adminRateLimits.delete(key));
  } else {
    // Clear all caches
    adminSessionCache.clear();
    adminRateLimits.clear();
  }
}

export function getAdminAuditLog(adminId: string, limit = 50) {
  const logs = adminAuditLog.get(adminId) || [];
  return logs.slice(-limit).reverse(); // Get most recent entries first
}

// Cleanup function to run periodically
export function cleanupAdminCaches() {
  const now = Date.now();
  
  // Clean expired session cache
  for (const [key, session] of adminSessionCache.entries()) {
    if (now - session.timestamp > ADMIN_CACHE_TTL) {
      adminSessionCache.delete(key);
    }
  }
  
  // Clean expired rate limits
  for (const [key, limit] of adminRateLimits.entries()) {
    if (now > limit.resetTime) {
      adminRateLimits.delete(key);
    }
  }
}

// Set up periodic cleanup (run every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupAdminCaches, 5 * 60 * 1000);
}