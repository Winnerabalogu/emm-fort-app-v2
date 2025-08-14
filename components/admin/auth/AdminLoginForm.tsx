// components/admin/auth/AdminLoginForm.tsx
"use client";

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { adminAuthenticate } from '@/actions/admin-auth.actions';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function AdminLoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} className="w-full bg-orange-600 hover:bg-orange-700">
      <Shield className="w-4 h-4 mr-2" />
      Admin Sign In
    </Button>
  );
}

export default function AdminLoginForm() {
  const [errorMessage, dispatch] = useActionState(adminAuthenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Sign in with your admin credentials</p>
        </div>
      </div>

      <form action={dispatch} className="space-y-6">
        <Input 
          label="ADMIN EMAIL" 
          type="email" 
          name="email"
          placeholder="Enter admin email address" 
          required 
        />
        
        <div className="relative">
          <Input 
            label="PASSWORD" 
            type={showPassword ? "text" : "password"}
            name="password" 
            placeholder="Enter admin password" 
            required 
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-right">
          <Link href="/admin/forgot-password" passHref>
            <span className="text-sm font-medium text-orange-600 hover:text-orange-500 cursor-pointer">
              Forgot admin password?
            </span>
          </Link>
        </div>

        <AdminLoginButton />

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </form>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">Admin Access Only</p>
            <p className="text-amber-700">
              This portal is restricted to authorized administrators only. 
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link href="/" passHref>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer">
            ← Back to main site
          </span>
        </Link>
      </div>
    </div>
  );
}