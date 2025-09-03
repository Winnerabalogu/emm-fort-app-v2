"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler ,UseFormRegister, FieldErrors} from 'react-hook-form';
import { signOut } from 'next-auth/react'; 
import { RegisterStep1Form } from '@/lib/form-types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
interface TermsCheckboxProps {
  register: UseFormRegister<RegisterStep1Form>;
  errors: FieldErrors<RegisterStep1Form>;
}

const TermsCheckbox = ({ register, errors }: TermsCheckboxProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            id="terms-checkbox"
            {...register("termsAccepted", { 
              required: "You must accept the terms and conditions to continue" 
            })}
            className={`w-5 h-5 text-orange-600 bg-gray-100 border-2 rounded focus:ring-orange-500 focus:ring-2 transition-colors ${
              errors.termsAccepted ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="terms-checkbox" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
            I have read and agree to the{' '}
            <Link 
              href="/terms" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline font-medium"
            >
              Terms of Service
            </Link>
            ,{' '}
            <Link 
              href="/privacy" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline font-medium"
            >
              Privacy Policy
            </Link>
            , and{' '}
            <Link 
              href="/cookies" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline font-medium"
            >
              Cookie Policy
            </Link>
            .
          </label>
          
          {/* Affiliate-specific terms notice */}
          <div className="mt-2 text-xs text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
            <p className="font-medium text-orange-800 mb-1">Affiliate Program Terms:</p>
            <ul className="list-disc list-inside space-y-0.5 text-orange-700">
              <li>Must be 18+ years old</li>
              <li>Annual registration with non-refundable fees</li>
              <li>One account per individual only</li>
              <li>Commission structure subject to updates</li>
              <li>Account termination at company discretion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors.termsAccepted && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errors.termsAccepted.message}</span>
        </div>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();  
  const refCode = searchParams.get('ref');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep1Form>({    
    defaultValues: {
      referral: refCode || '',
      termsAccepted: false, 
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
        body: JSON.stringify({
          ...data,
          // Don't send termsAccepted to backend - it's just for validation
          termsAccepted: undefined,
        }),
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

        {/* Terms and Conditions Checkbox */}
        <div className="pt-4 border-t border-gray-200">
          <TermsCheckbox register={register} errors={errors} />
        </div>

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