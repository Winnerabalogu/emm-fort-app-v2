// lib/admin-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { User } from 'next-auth';
import { ZodError } from 'zod';

type AdminApiHandler = (
  req: NextRequest,
  admin: User, 
  context?: { params?: Record<string, string | string[]> } 
) => Promise<NextResponse>;

export function withAdmin(handler: AdminApiHandler) {
  return async (req: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unauthorized: No active session.' 
          },
          { status: 401 }
        );
      }      
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Forbidden: Admin access required.' 
          },
          { status: 403 }
        );
      }
      return await handler(req, session.user, context || {});

    } catch (error) {
      console.error(`[Admin API Error] ${req.method} ${req.nextUrl.pathname}:`, error);

      // 4. Centralized Error Handling
      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid input data provided.',
            details: error.flatten().fieldErrors
          },
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        // Handle specific known errors
        if (error.message.includes("not found")) {
          return NextResponse.json(
            { 
              success: false,
              error: error.message 
            }, 
            { status: 404 }
          );
        }

        if (error.message.includes("Unauthorized") || error.message.includes("unauthorized")) {
          return NextResponse.json(
            { 
              success: false,
              error: error.message 
            }, 
            { status: 401 }
          );
        }

        if (error.message.includes("Forbidden") || error.message.includes("forbidden")) {
          return NextResponse.json(
            { 
              success: false,
              error: error.message 
            }, 
            { status: 403 }
          );
        }
      }

      // Generic server error for unhandled cases
      return NextResponse.json(
        { 
          success: false,
          error: 'An internal server error occurred.' 
        },
        { status: 500 }
      );
    }
  };
}