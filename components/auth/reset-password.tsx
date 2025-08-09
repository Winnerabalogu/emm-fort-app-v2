"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const password = watch('password');

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-400' },
      3: { text: 'Good', color: 'bg-blue-400' },
      4: { text: 'Strong', color: 'bg-green-400' },
      5: { text: 'Very Strong', color: 'bg-green-500' }
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setMessage({ type: 'success', text: result.message });
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect
  }

  if (success) {
    return (
      <div className="w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Password Reset Successful</h1>
            <p className="text-gray-600 mt-2">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/auth/login">
            <Button className="w-full">
              Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lock className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Reset Password</h1>
        </div>
        <p className="text-gray-600">
          Create a new secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="relative">
            <Input
              label="NEW PASSWORD"
              type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
              placeholder="Enter new password"
              error={errors.password?.message}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {password && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 min-w-20">{passwordStrength.text}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                  <ul className="grid grid-cols-2 gap-2 text-xs">
                    <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      8+ characters
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      Uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      Lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      Number
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="CONFIRM PASSWORD"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords don't match"
              })}
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
          Reset Password
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
    </div>
  );
}