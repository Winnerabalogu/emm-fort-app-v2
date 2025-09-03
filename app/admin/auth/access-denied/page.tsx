// app/admin/access-denied/page.tsx
import AdminAuthLayout from '@/components/admin/auth/AdminAuthLayout';
import Link from 'next/link';
import { ShieldX, ArrowLeft, Shield } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminAccessDeniedPage() {
  const session = await auth();
  
  // If not logged in at all, redirect to admin login
  if (!session?.user) {
    redirect('/admin/auth/login');
  }
  
  // If they're actually an admin, redirect to admin overview
  if (session.user.role === 'ADMIN') {
    redirect('/admin/overview');
  }

  return (
    <AdminAuthLayout>
      <div className="w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don&apos;t have administrator privileges</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-red-800 mb-2">Administrator Access Required</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                You are currently logged in as a regular user ({session.user.fullName}). 
                The admin portal requires administrator privileges to access.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-left">
                <p className="font-semibold text-amber-800 mb-1">Need Admin Access?</p>
                <p className="text-amber-700">
                  Contact your system administrator to request admin privileges for your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to User Dashboard
            </button>
          </Link>
          
          <Link href="/admin/auth/login">
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
    </AdminAuthLayout>
  );
}