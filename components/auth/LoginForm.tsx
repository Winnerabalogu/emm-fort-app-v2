"use client";

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth.actions';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button'; 
import { ChevronLeft } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} className="w-full">
      Sign In
    </Button>
  );
}


export default function LoginForm() {
  // useFormState hook to manage form state and display errors from the server action.
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="w-full bg-white rounded-lg shadow-md sm:max-w-md p-6 sm:p-8 space-y-6">
       <Link href="/" className="flex items-center text-sm font-semibold text-orange-600 hover:text-orange-800">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Login</h1>
        <p className="text-gray-500 mt-1">Add your details below to log in the app</p>
      </div>

      {/* The form now calls the server action directly */}
      <form action={dispatch} className="space-y-6">
        <Input 
          label="EMAIL" 
          type="email" 
          name="email" // 'name' attribute is required for FormData
          placeholder="Enter email address" 
          required 
        />
        <Input 
          label="PASSWORD" 
          type="password" 
          name="password" // 'name' attribute is required for FormData
          placeholder="Enter password" 
          required 
        />

        <div className="text-right">
            <Link href="/auth/forgot-password" passHref>
                <span className="text-sm font-medium text-orange-600 hover:text-orange-500 cursor-pointer">Forgot password?</span>
            </Link>
        </div>
        
        {/* The LoginButton component handles its own loading state */}
        <LoginButton />
        
        {errorMessage && (
          <div className="text-sm text-red-600 text-center mt-2">
            <p>{errorMessage}</p>
          </div>
        )}
      </form>
      
      <p className="text-sm text-center text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" passHref>
            <span className="font-medium text-orange-600 hover:text-orange-500 cursor-pointer">Create account</span>
        </Link>
      </p>
    </div>
  );
}