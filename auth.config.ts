import type { NextAuthConfig } from 'next-auth';
export const authConfig = {
  pages: {
    signIn: '/auth/login',
    // You can add admin-specific error pages if needed
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isOnAdminLogin = nextUrl.pathname === '/admin/auth/login';
      
      // Admin route protection
      if (isOnAdminRoute && !isOnAdminLogin) {
        if (!isLoggedIn || userRole !== 'ADMIN') {
          // Redirect to admin login instead of regular login
          return Response.redirect(new URL('/admin/auth/login', nextUrl));
        }
        return true;
      }
      
      // If admin trying to access admin login when already logged in
      if (isOnAdminLogin && isLoggedIn && userRole === 'ADMIN') {
        return Response.redirect(new URL('/admin/overview', nextUrl));
      }
      
      // Regular user routes (your existing logic)
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true; 
        return false; 
      }
      
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
  },
  providers: [], 
} satisfies NextAuthConfig;