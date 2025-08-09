"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';

function VerificationStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your link.');
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
    <div className="w-full space-y-8">
      <div className="text-center space-y-6">
      {status === 'loading' && (
        <>
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <LoaderCircle className="w-16 h-16 text-orange-600 animate-spin" />
          </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Verifying Account</h1>
              <p className="text-gray-600 mt-2">Please wait while we verify your email...</p>
            </div>
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
          </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Verification Failed</h1>
              <p className="text-gray-600 mt-2">We couldn&apos;t verify your account</p>
            </div>
        </>
      )}
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-700">{message}</p>
        {status === 'success' && (
          <p className="text-sm text-gray-600 mt-2">Redirecting to login page in 3 seconds...</p>
        )}
      </div>

      {status !== 'loading' && (
        <div className="text-center space-y-4">
          {status === 'success' ? (
            <Link href="/auth/login">
              <Button className="w-full">
                Continue to Login
              </Button>
            </Link>
          ) : (
            <div className="space-y-3">
              <Link href="/auth/register">
                <Button className="w-full">
                  Try Registration Again
                </Button>
              </Link>
              <Link href="/auth/login" className="block text-sm font-medium text-orange-600 hover:text-orange-500">
          Back to Login
        </Link>
            </div>
          )}
        </div>
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