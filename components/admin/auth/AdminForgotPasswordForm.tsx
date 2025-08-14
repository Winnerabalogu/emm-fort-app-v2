// components/admin/auth/AdminForgotPasswordForm.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminForgotPasswordForm {
  email: string;
}

export default function AdminForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AdminForgotPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: AdminForgotPasswordForm) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/auth/forgot-password', {
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
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Admin password reset link has been sent to your email.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Security Notice</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Admin reset links expire in 1 hour for security</li>
                <li>• Check your spam/junk folder</li>
                <li>• Contact system administrator if issues persist</li>
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
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Admin Password Reset</h1>
          <p className="text-gray-600 mt-2">
            Enter your admin email to receive a reset link
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="ADMIN EMAIL" 
          type="email" 
          {...register("email", { 
            required: "Admin email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address"
            }
          })}
          placeholder="Enter admin email address" 
          error={errors.email?.message}
        />

        <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-700">
          Send Admin Reset Link
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

      <div className="text-center pt-4 border-t border-gray-200 space-y-3">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/admin/login" className="font-medium text-orange-600 hover:text-orange-500">
            Admin Sign in
          </Link>
        </p>
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Back to main site
        </Link>
      </div>
    </div>
  );
}
