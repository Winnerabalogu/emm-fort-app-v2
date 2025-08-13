// components/modal/EditUserModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  tier: string;
  isVerified: boolean;
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
  createdAt: string;
  totalCommissions: number;
  directReferrals: number;
  role?: string;
}

interface EditFormInputs {
  fullName: string;
  email: string;
  phoneNumber: string;
  tier: string;
  subscriptionMonths: number;
  isVerified: boolean;
}

const TIER_OPTIONS = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' }
];

export default function EditUserModal() {
  const { closeModal, payload } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = payload?.user as User;

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm<EditFormInputs>({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      tier: user?.tier || 'BASIC',
      subscriptionMonths: 0,
      isVerified: user?.isVerified || false
    }
  });

  if (!user) {
    return (
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  const watchedTier = watch('tier');
  const watchedVerified = watch('isVerified');
  const watchedSubscriptionMonths = watch('subscriptionMonths');

  const onSubmit: SubmitHandler<EditFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare updates array
      const updates = [];

      // Check what changed and prepare update requests
      if (data.fullName !== user.fullName || data.email !== user.email || data.phoneNumber !== user.phoneNumber) {
        updates.push({
          action: 'update_profile',
          data: {
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber
          }
        });
      }

      if (data.tier !== user.tier) {
        updates.push({
          action: 'update_tier',
          data: { tier: data.tier }
        });
      }

      if (data.isVerified !== user.isVerified) {
        updates.push({
          action: data.isVerified ? 'verify' : 'unverify'
        });
      }

      if (data.subscriptionMonths > 0) {
        updates.push({
          action: 'extend_subscription',
          data: { months: data.subscriptionMonths }
        });
      }

      // Execute all updates sequentially
      for (const update of updates) {
        const response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: update.action,
            data: update.data
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || `Failed to ${update.action.replace('_', ' ')}`);
        }
      }

      toast.success('User updated successfully!');
      payload?.onSuccess?.();
      closeModal();

    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSubscriptionActive = () => {
    if (!user.subscriptionExpiryDate) return false;
    return new Date(user.subscriptionExpiryDate) > new Date();
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-orange-800">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            <p className="text-sm text-gray-500">@{user.username}</p>
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

        {/* Account Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Account Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier
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
              {watchedTier !== user.tier && (
                <p className="text-orange-600 text-xs mt-1">
                  Tier will be changed from {user.tier} to {watchedTier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  {...register('isVerified')}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Email Verified</span>
              </div>
              {watchedVerified !== user.isVerified && (
                <p className="text-orange-600 text-xs mt-1">
                  User will be {watchedVerified ? 'verified' : 'unverified'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Subscription Management</h4>
          
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Current Status:</span>
                <span className={`ml-2 ${isSubscriptionActive() ? 'text-green-600' : 'text-red-600'}`}>
                  {isSubscriptionActive() ? 'Active' : 'Expired/None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Expiry Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(user.subscriptionExpiryDate)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extend Subscription (Months)
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
              placeholder="Enter number of months to extend"
            />
            {errors.subscriptionMonths && (
              <p className="text-red-500 text-xs mt-1">{errors.subscriptionMonths.message}</p>
            )}
            {watchedSubscriptionMonths > 0 && (
              <p className="text-orange-600 text-xs mt-1">
                Subscription will be extended by {watchedSubscriptionMonths} month{watchedSubscriptionMonths > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Changes to user information will be applied immediately</li>
                <li>Tier changes may affect commission calculations</li>
                <li>Subscription extensions are non-reversible</li>
                <li>All changes will be logged for audit purposes</li>
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
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}