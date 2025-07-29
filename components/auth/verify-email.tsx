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

        setStatus('success');
        setMessage(data.message || 'Email verified successfully! You can now log in.');

        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);

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
          <h1 className="text-2xl font-bold">Verifying...</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Verification Successful!</h1>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Verification Failed</h1>
        </>
      )}
      
      <p className="text-gray-600">{message}</p>

      {status !== 'loading' && (
        <Link href="/auth/login" className="inline-block px-6 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700">
          Go to Login
        </Link>
      )}
    </div>
  );
}


// The main page export wraps the component in a <Suspense> boundary.
// This is required for components that use `useSearchParams`.
export default function VerifyTokenPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <VerificationStatus />
    </Suspense>
  );
}