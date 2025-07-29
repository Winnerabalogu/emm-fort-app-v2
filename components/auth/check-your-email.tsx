// app/auth/check-your-email/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

// Inner component to safely use useSearchParams
function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-xl">
            <div className="flex justify-center">
                <Mail className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Check Your Inbox
            </h1>
            <p className="text-gray-600">
                We&apos;ve sent a verification link to the email address you provided.
            </p>
            {email && (
                <p className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 rounded-md">
                    {email}
                </p>
            )}
            <p className="text-sm text-gray-500">
                Please click the link in the email to complete your registration. Be sure to check your spam or junk folder if you don&apos;t see it.
            </p>
            <div className="pt-4">
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-700">
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
}


// The main page export wraps the component in a <Suspense> boundary
// because its child uses `useSearchParams`.
export default function CheckYourEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckEmailContent />
        </Suspense>
    )
}