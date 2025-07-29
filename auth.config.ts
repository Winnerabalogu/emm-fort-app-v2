import type { Session } from 'next-auth';

export const authConfig = {  
  providers: [], 

  pages: {
    signIn: '/auth/login',
  },

  callbacks: {
    // This is our middleware logic. It is Edge-safe.
     authorized({ auth, request: { nextUrl } }: {
      auth: Session | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!auth?.user;
      const hasActiveSubscription = !!auth?.user?.subscriptionStartDate;

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      const isOnOnboardingRoute = 
        nextUrl.pathname.startsWith('/dashboard/tier-selection') || 
        nextUrl.pathname.startsWith('/dashboard/upgrade-success');

      // 1. If user is trying to access the dashboard
      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Not logged in? Block.

        // Logged in, but no subscription and NOT on an onboarding page? Force to onboarding.
        if (!hasActiveSubscription && !isOnOnboardingRoute) {
          return Response.redirect(new URL('/dashboard/tier-selection', nextUrl));
        }
      } 
      // 2. If user is logged in and trying to access an auth page
      else if (isLoggedIn && nextUrl.pathname.startsWith('/auth')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // 3. Otherwise, allow access.
      return true;
    },
  },
}