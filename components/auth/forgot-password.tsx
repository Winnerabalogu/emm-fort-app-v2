"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setMessage({ type: 'success', text: result.message });
      setEmailSent(true);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-gray-600 mt-2 text-lg">
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Didn&apos;t receive the email?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes for the email to arrive</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <button 
            onClick={() => {
              setEmailSent(false);
              setMessage(null);
            }}
            className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
          >
            Try again with a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-gray-600 mt-2">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="EMAIL" 
          type="email" 
          {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address"
            }
          })}
          placeholder="Enter your email address" 
          error={errors.email?.message}
        />

        <Button type="submit" isLoading={loading} className="w-full">
          Send Reset Link
        </Button>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </form>

      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}