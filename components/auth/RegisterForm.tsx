"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signOut } from 'next-auth/react'; 
import { RegisterStep1Form } from '@/lib/form-types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();  
  const refCode = searchParams.get('ref');

   const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep1Form>({    
    defaultValues: {
      referral: refCode || '',
    }
  });

  useEffect(() => {    
    signOut({ redirect: false }); 
  }, []);

  const onSubmit: SubmitHandler<RegisterStep1Form> = async (data) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {        
        const errorMessage = result.error || "An unknown error occurred.";
        throw new Error(errorMessage);
      }
      
      router.push(`/auth/check-your-email?email=${encodeURIComponent(data.email)}`);

    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
      setIsLoading(false); 
    }    
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join us and start your journey today</p>
      </div>      
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">        
        <Input 
          label="FULL NAME" 
          {...register("fullName", { required: "Full name is required" })} 
          placeholder="Enter your full name"
          error={errors.fullName?.message}
        />

        <Input 
          label="USERNAME" 
          {...register("username", { required: "Username is required" })} 
          placeholder="Choose a username"
          error={errors.username?.message}
        />

        <Input 
          label="EMAIL" 
          type="email" 
          {...register("email", { required: "Email is required" })} 
          placeholder="Enter your email address"
          error={errors.email?.message}
        />

        <Input 
          label="PHONE NUMBER" 
          type="tel" 
          {...register("phone", { required: "Phone number is required" })} 
          placeholder="Enter your phone number"
          error={errors.phone?.message}
        />
        
        <Input 
          label="REFERRAL CODE (OPTIONAL)" 
          {...register("referral")} 
          placeholder="Enter referral code if you have one" 
        />

        <Input 
          label="PASSWORD" 
          type="password" 
          {...register("password", { 
            required: "Password is required", 
            minLength: { value: 6, message: "Password must be at least 6 characters" } 
          })} 
          placeholder="Create a secure password"
          error={errors.password?.message}
        />

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full mt-6">
          Create Account
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}