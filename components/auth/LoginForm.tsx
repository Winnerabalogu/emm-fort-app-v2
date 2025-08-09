"use client";

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth.actions';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button'; 

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} className="w-full">
      Sign In
    </Button>
  );
}

export default function LoginForm() {  
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
      </div>      
      
      <form action={dispatch} className="space-y-6">
        <Input 
          label="EMAIL" 
          type="email" 
          name="email"
          placeholder="Enter your email address" 
          required 
        />
        <Input 
          label="PASSWORD" 
          type="password" 
          name="password" 
          placeholder="Enter your password" 
          required 
        />

        <div className="text-right">
          <Link href="/auth/forgot-password" passHref>
            <span className="text-sm font-medium text-orange-600 hover:text-orange-500 cursor-pointer">
              Forgot password?
            </span>
          </Link>
        </div>                
        
        <LoginButton />
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </form>
      
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" passHref>
            <span className="font-medium text-orange-600 hover:text-orange-500 cursor-pointer">
              Create account
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}