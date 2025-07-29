"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';

function VerificationStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account, please wait...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification link is invalid or missing a token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed.');
        }
        
        if (data.email) {
          // Store the user's email to identify them in the next step.
          localStorage.setItem('user_email_for_onboarding', data.email);
        }

        setStatus('success');
        setMessage(data.message || 'Email verified! Redirecting to select your plan...');

        setTimeout(() => {
          router.push('/auth/tier-selection');
        }, 2000);

      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
      {status === 'loading' && (
        <>
          <div className="flex justify-center">
            <LoaderCircle className="w-16 h-16 text-orange-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verifying...</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">Verification Successful!</h1>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-700">Verification Failed</h1>
        </>
      )}
      
      <p className="text-gray-600 min-h-[40px] flex items-center justify-center">{message}</p>

      {status === 'error' && (
        <Link href="/auth/login" className="inline-block px-6 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700">
          Back to Login
        </Link>
      )}
    </div>
  );
}

export default function VerifyTokenPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <LoaderCircle className="w-16 h-16 mx-auto text-orange-500 animate-spin" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Loading...</h1>
      </div>
    }>
      <VerificationStatus />
    </Suspense>
  );
}