// app/creator/auth/access-denied/page.tsx
import Link from 'next/link';
import { ShieldX, ArrowLeft, Shield } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CreatorAccessDeniedPage() {
  const session = await auth();
  const isCreator = session?.user.isCreator;

  // If not logged in, redirect to creator login
  if (!session?.user) {
    redirect('/creator/auth/login');
  }
    
  // If already a creator, redirect to creator dashboard
  if (isCreator) {
    redirect('/creator/dashboard'); // Use redirect() not Response.redirect()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldX className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600 mt-2">You&apos;re not a Creator</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Creator Access Required</h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    You are currently logged in as a regular user ({session.user.fullName}). 
                    The creator portal requires creator privileges to access.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-left">
                    <p className="font-semibold text-amber-800 mb-1">Want to become a Creator?</p>
                    <p className="text-amber-700">
                      Join our creator program and start earning commissions on your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/creator/auth/register">
                <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                  Join Creator Program
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go to User Dashboard
                </button>
              </Link>
              
              <Link href="/creator/auth/login">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
                  Sign in as Different User
                </button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                This attempt has been logged for security purposes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}