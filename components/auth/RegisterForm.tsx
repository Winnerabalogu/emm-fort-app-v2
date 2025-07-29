"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signOut } from 'next-auth/react'; 
import { ChevronLeft } from 'lucide-react';
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
    <div className="w-full bg-white rounded-lg shadow-md sm:max-w-md p-6 sm:p-8 space-y-6">
      <Link href="/" className="flex items-center text-sm font-semibold text-orange-600 hover:text-orange-800">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Create an Account</h1>
        <p className="text-gray-500 mt-1">Let&apos;s get you started on your journey.</p>
      </div>      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">        
        <Input label="FULL NAME" {...register("fullName", { required: "Full name is required" })} placeholder="Enter full name" />
        {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}

        <Input label="USERNAME" {...register("username", { required: "Username is required" })} placeholder="Enter username" />
        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}

        <Input label="EMAIL" type="email" {...register("email", { required: "Email is required" })} placeholder="Enter email address" />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

        <Input label="PHONE NUMBER" type="tel" {...register("phone", { required: "Phone number is required" })} placeholder="Enter phone number" />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        
         <Input label="REFERRAL (OPTIONAL)" {...register("referral")} placeholder="Enter referral code" />

        <Input label="PASSWORD" type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} placeholder="Create a password" />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        {/* Display API errors here */}
        {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}

        <Button type="submit" isLoading={isLoading} className="mt-2">
          Create Account
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
          Login
        </Link>
      </p>
    </div>
  );
}