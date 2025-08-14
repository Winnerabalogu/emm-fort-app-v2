// components/admin/auth/AdminResetPasswordForm.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface AdminResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function AdminResetPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AdminResetPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      router.push('/admin/forgot-password');
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

  const onSubmit = async (data: AdminResetPasswordForm) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/auth/reset-password', {
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
      
      setTimeout(() => {
        router.push('/admin/login');
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
    return null;
  }

  if (success) {
    return (
      <div className="w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Admin Password Reset Successful</h1>
            <p className="text-gray-600 mt-2">
              Your admin password has been successfully reset. Redirecting to admin login...
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/admin/login">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Continue to Admin Login
            </Button>
          </Link>
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
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Reset Admin Password</h1>
          <p className="text-gray-600">
            Create a new secure password for admin access
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="relative">
            <Input
              label="NEW ADMIN PASSWORD"
              type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 12, message: "Admin password must be at least 12 characters" }
              })}
              placeholder="Enter new admin password"
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
                  <p className="text-xs font-medium text-gray-700 mb-2">Admin password requirements:</p>
                  <ul className="grid grid-cols-2 gap-2 text-xs">
                    <li className={`flex items-center gap-2 ${password.length >= 12 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      12+ characters
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
                    <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} />
                      Special character
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="CONFIRM ADMIN PASSWORD"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords don't match"
              })}
              placeholder="Confirm new admin password"
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

        <Button type="submit" isLoading={loading} className="w-full bg-orange-600 hover:bg-orange-700">
          Reset Admin Password
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