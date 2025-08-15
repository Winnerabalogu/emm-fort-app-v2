// components/admin/users/CreateUserModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Plus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';

interface CreateFormInputs {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  tier: string;
  subscriptionMonths: number;
  isVerified: boolean;
  sendWelcomeEmail: boolean;
}

const TIER_OPTIONS = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' }
];

export default function CreateUserModal() {
  const { closeModal, payload } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setError,
    setValue 
  } = useForm<CreateFormInputs>({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      tier: 'BASIC',
      subscriptionMonths: 0,
      isVerified: true,
      sendWelcomeEmail: true
    }
  });

  const watchedPassword = watch('password');
  const watchedSubscriptionMonths = watch('subscriptionMonths');

  const onSubmit: SubmitHandler<CreateFormInputs> = async (data) => {
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          tier: data.tier,
          subscriptionMonths: data.subscriptionMonths,
          isVerified: data.isVerified,
          sendWelcomeEmail: data.sendWelcomeEmail
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      if (result.success) {
        toast.success('User created successfully!');
        payload?.onSuccess?.();
        closeModal();
      } else {
        throw new Error(result.error || 'Failed to create user');
      }

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    // Set the generated password in both password fields
    setValue('password', newPassword);
    setValue('confirmPassword', newPassword);
    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(newPassword);
    toast.success('Password generated, set in form, and copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Plus className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
            <p className="text-sm text-gray-500">Add a new user to the platform</p>
          </div>
        </div>
        <button
          onClick={closeModal}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('fullName', { 
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phoneNumber', { 
                  required: 'Phone number is required',
                  minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Password</h4>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
            >
              Generate Password
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: value => value === watchedPassword || 'Passwords do not match'
                  })}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Account Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Tier
              </label>
              <select
                {...register('tier')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {TIER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription (Months)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                {...register('subscriptionMonths', {
                  min: { value: 0, message: 'Cannot be negative' },
                  max: { value: 24, message: 'Maximum 24 months allowed' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
              />
              {errors.subscriptionMonths && (
                <p className="text-red-500 text-xs mt-1">{errors.subscriptionMonths.message}</p>
              )}
              {watchedSubscriptionMonths > 0 && (
                <p className="text-green-600 text-xs mt-1">
                  Will expire on: {new Date(Date.now() + (watchedSubscriptionMonths * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isVerified')}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Mark email as verified</span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('sendWelcomeEmail')}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Send welcome email to user</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Information:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>User will be created with the specified settings</li>
                <li>If welcome email is enabled, login credentials will be sent</li>
                <li>User can change their password after first login</li>
                <li>All actions will be logged for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}