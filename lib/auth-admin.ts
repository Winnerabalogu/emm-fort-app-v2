// lib/auth-admin.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { User } from 'next-auth';
import { ZodError } from 'zod';

type AdminApiHandler = (
  req: NextRequest,
  admin: User, 
  context?: { params?: Record<string, string | string[]> } 
) => Promise<NextResponse>;

// Admin session caching
const adminSessionCache = new Map<string, { isAdmin: boolean; user: User; timestamp: number }>();
const ADMIN_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Rate limiting for admin routes
const adminRateLimits = new Map<string, { count: number; resetTime: number }>();
const ADMIN_RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Admin audit logging
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
      
      // Clean old cache entries periodically
      if (adminSessionCache.size > 1000) {
        const oldestEntries = Array.from(adminSessionCache.entries())
          .sort(([,a], [,b]) => a.timestamp - b.timestamp)
          .slice(0, 500);
        
        oldestEntries.forEach(([key]) => adminSessionCache.delete(key));
      }
      
      return sessionData;
    }
  } catch (error) {
    console.error('Admin session cache error:', error);
  }
  
  return null;
}

function checkAdminRateLimit(adminId: string, ip?: string): boolean {
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
  logs.push({
    action,
    timestamp: Date.now(),
    ip
  });
  
  // Keep only recent entries
  if (logs.length > MAX_AUDIT_ENTRIES) {
    logs.splice(0, logs.length - MAX_AUDIT_ENTRIES);
  }
  
  adminAuditLog.set(adminId, logs);
}

export function withAdmin(handler: AdminApiHandler) {
  return async (req: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    const startTime = Date.now();
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    try {
      // Extract session token for caching
      const sessionToken = req.cookies.get('authjs.session-token')?.value || 
                           req.cookies.get('__Secure-authjs.session-token')?.value;
      
      if (!sessionToken) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unauthorized: No session token found.' 
          },
          { status: 401 }
        );
      }

      // Get cached admin session
      const cachedSession = await getCachedAdminSession(sessionToken);
      
      if (!cachedSession) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unauthorized: Invalid or expired admin session.' 
          },
          { status: 401 }
        );
      }
      
      if (!cachedSession.isAdmin) {
        logAdminActivity(cachedSession.user.id, `UNAUTHORIZED_ACCESS_ATTEMPT:${req.method}:${req.nextUrl.pathname}`, clientIp);
        return NextResponse.json(
          { 
            success: false,
            error: 'Forbidden: Admin access required.' 
          },
          { status: 403 }
        );
      }

      // Check rate limiting
      if (!checkAdminRateLimit(cachedSession.user.id, clientIp)) {
        logAdminActivity(cachedSession.user.id, `RATE_LIMIT_EXCEEDED:${req.method}:${req.nextUrl.pathname}`, clientIp);
        return NextResponse.json(
          { 
            success: false,
            error: 'Rate limit exceeded. Please try again later.' 
          },
          { status: 429 }
        );
      }

      // Log admin activity
      logAdminActivity(
        cachedSession.user.id, 
        `${req.method}:${req.nextUrl.pathname}`, 
        clientIp
      );

      // Execute the handler
      const response = await handler(req, cachedSession.user, context || {});
      
      // Add performance monitoring
      const duration = Date.now() - startTime;
      if (duration > 5000) { // Log slow requests
        console.warn(`[Admin API Slow Query] ${req.method} ${req.nextUrl.pathname} took ${duration}ms`);
      }

      // Add security headers to response
      response.headers.set('X-Admin-Request', 'true');
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Admin API Error] ${req.method} ${req.nextUrl.pathname} (${duration}ms):`, error);

      // Enhanced error handling with logging
      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid input data provided.',
            details: process.env.NODE_ENV === 'development' ? error.flatten().fieldErrors : undefined
          },
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        // Handle specific known errors
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("not found")) {
          return NextResponse.json(
            { success: false, error: 'Resource not found.' }, 
            { status: 404 }
          );
        }

        if (errorMessage.includes("unauthorized")) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized access.' }, 
            { status: 401 }
          );
        }

        if (errorMessage.includes("forbidden")) {
          return NextResponse.json(
            { success: false, error: 'Forbidden access.' }, 
            { status: 403 }
          );
        }

        if (errorMessage.includes("timeout") || errorMessage.includes("query timeout")) {
          return NextResponse.json(
            { success: false, error: 'Request timeout. Please try again.' }, 
            { status: 408 }
          );
        }

        // Log unexpected errors in production
        if (process.env.NODE_ENV === 'production') {
          console.error(`[Admin API Unexpected Error] ${req.method} ${req.nextUrl.pathname}:`, {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            adminId: 'unknown',
            ip: clientIp
          });
        }
      }

      // Generic server error for unhandled cases
      return NextResponse.json(
        { 
          success: false,
          error: 'An internal server error occurred. Please try again later.' 
        },
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