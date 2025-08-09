"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const SuccessLoader = () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div 
        className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"
        style={{ animationDuration: '1.5s' }}
      ></div>
    </div>
);

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center p-8 max-w-md w-full">
        {isLoading ? (
          // Loading State
          <div className="fade-in flex flex-col items-center">
            <SuccessLoader />
            <h1 className="mt-6 text-2xl font-bold text-gray-800">Confirming Your Subscription</h1>
            <p className="mt-2 text-gray-600">Please wait while we finalize your subscription. This won&apos;t take long.</p>
          </div>
        ) : (
          // Success State
          <div className="fade-in flex flex-col items-center">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Subscription Successful!</h1>
            <p className="mt-2 text-lg text-gray-600">
              Your account has been upgraded successfully. Check your email for confirmation details.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 A confirmation email has been sent with your subscription details and next steps.
              </p>
            </div>
            <div className="mt-8">
              <Link 
                href="/auth/login" 
                className="inline-block px-8 py-3 text-white bg-orange-600 rounded-md hover:bg-orange-700 font-semibold transition-transform hover:scale-105"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}