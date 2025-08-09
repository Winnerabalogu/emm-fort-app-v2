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
        <div className="w-full space-y-8">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-orange-600" />
                </div>
                
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        Check Your Email
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        We&apos;ve sent a verification link to confirm your account
                    </p>
                </div>
            </div>

            {email && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Email sent to:</p>
                    <p className="text-lg font-semibold text-gray-900 break-all">
                        {email}
                    </p>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center text-blue-800">
                    <p className="font-semibold mb-3">Next steps:</p>
                    <ul className="text-sm space-y-2 text-left max-w-sm mx-auto">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">1.</span>
                            Check your email inbox
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">2.</span>
                            Click the verification link
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">3.</span>
                            Return here to sign in
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-2">
                <p>Didn&apos;t receive the email? Check your spam folder.</p>
                <p>
                    Having trouble?{' '}
                    <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-500">
                        Try registering again
                    </Link>
                </p>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
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
        <Suspense fallback={<div className="text-center">Loading...</div>}>
            <CheckEmailContent />
        </Suspense>
    );
}