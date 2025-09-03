/* eslint-disable @typescript-eslint/no-unused-vars */
// middleware.ts - FIXED: Use the same auth instance as login
import { auth } from '@/auth'; // Import from auth.ts, not auth.config.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Enhanced security headers for admin routes
  if (pathname.startsWith('/admin')) {
    // Strict security headers for admin panel
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Strict CSP for admin routes
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Next.js development
        "style-src 'self' 'unsafe-inline'", // Needed for Tailwind
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    );

    // Add cache control for admin routes
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Add general security headers for all routes
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Add CSRF protection headers
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Basic CSRF protection - ensure origin matches host for state-changing operations
    if (origin && host && !origin.includes(host)) {
      console.warn(`[Security] CSRF attempt detected: ${origin} -> ${host}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Rate limiting for API routes (basic implementation)
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Add rate limiting headers (implement actual rate limiting in your withAdmin wrapper)
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99'); // This would be dynamic in real implementation
  }

  return response;
});

export const config = {
  matcher: [
    // Match all routes except static files and NextAuth API routes
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};