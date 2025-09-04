"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function CreatorLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // First check if user exists and is a creator
      const checkResponse = await fetch('/api/creator/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        if (checkResponse.status === 403 && checkData.needsVerification) {
          router.push(`/creator/auth/check-your-email?email=${encodeURIComponent(checkData.email)}`);
          return;
        }
        throw new Error(checkData.error || 'User validation failed');
      }

      // Use NextAuth signIn
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid credentials');
      }

      if (result?.ok) {
        router.push('/creator/dashboard');
        router.refresh();
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/20 rounded-full blur-lg"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-6 w-6" />
              <span className="font-semibold">Creator Program</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Turn Your Content Into
              <span className="block bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                Real Income
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
              Join thousands of creators earning 5% commission on every grocery order through your content
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">5%</div>
              <div className="text-sm text-white/80">Commission Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">Earnings Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Free</div>
              <div className="text-sm text-white/80">To Join</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Component */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Creator Program</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back, Creator!</h2>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your creator account</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                Forgot your password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <Link href={'/creator/auth/register'}>
            <p className="text-sm text-gray-600">            
              New to the creator program?{' '}
              <button className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                Join today and start earning
              </button>
            </p>
            </Link>
          </div>

          {/* Back to main site */}
          <div className="mt-6 text-center">
            <Link href={'/'}>
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to EMM-FORT
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}