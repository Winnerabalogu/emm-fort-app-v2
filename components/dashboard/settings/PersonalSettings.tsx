// components/dashboard/settings/PersonalSettings.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { User, Mail, Phone, AtSign, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
}

export default function PersonalSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileData>();

  // Fetch initial profile data
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        reset(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile data.");
        setIsLoading(false);
      });
  }, [reset]);

  const onSubmit: SubmitHandler<ProfileData> = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update profile.");
      
      setSuccessMessage(result.message);
      reset(data);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 sm:p-8 border border-orange-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-gray-600 mt-1">Keep your account information up to date for better security and communication.</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <div className="relative">
              <Input
                          label={''} {...register("fullName", {
                              required: "Full name is required",
                              minLength: { value: 2, message: "Name must be at least 2 characters" }
                          })}
                          placeholder="Enter your full name"
                          className={`pl-10 ${errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          style={{ paddingLeft: '2.5rem' }}              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fullName && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <AtSign className="h-4 w-4" />
              Username
            </label>
            <div className="relative">
              <Input
                          label={''} {...register("username", {
                              required: "Username is required",
                              minLength: { value: 3, message: "Username must be at least 3 characters" },
                              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" }
                          })}
                          placeholder="Enter your username"
                          className={`pl-10 ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          style={{ paddingLeft: '2.5rem' }}              />
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.username && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <div className="relative">
              <input
                {...register("email")}
                disabled
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="h-3 w-3" />
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            <div className="relative">
              <Input
                          label={''} {...register("phone", {
                              required: "Phone number is required",
                              pattern: { value: /^\+?[1-9]\d{1,14}$/, message: "Please enter a valid phone number" }
                          })}
                          placeholder="Enter your phone number"
                          className={`pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          style={{ paddingLeft: '2.5rem' }}              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.phone && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 order-2 sm:order-1">
          {isDirty && (
            <>
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span>You have unsaved changes</span>
            </>
          )}
        </div>
        
        <div className="flex gap-3 order-1 sm:order-2">
          <Button
            type="button"            
            onClick={() => window.location.reload()}
            className="px-6"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            className="px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}