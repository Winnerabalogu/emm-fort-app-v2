// components/admin/users/ViewUserModal.tsx
"use client";

import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Award, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';

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

export default function ViewUserModal() {
  const { closeModal, payload } = useModal();
  const [processing, setProcessing] = useState<string | null>(null);
  
  const user = payload?.user as User;

  if (!user) {
    return (
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'gold':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'silver':
        return 'text-slate-700 bg-slate-100 border-slate-300';
      case 'bronze':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      default:
        return 'text-blue-700 bg-blue-100 border-blue-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-purple-700 bg-purple-100 border-purple-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const isSubscriptionActive = () => {
    if (!user.subscriptionExpiryDate) return false;
    return new Date(user.subscriptionExpiryDate) > new Date();
  };

  const getSubscriptionStatus = () => {
    if (!user.subscriptionStartDate) return { status: 'No Subscription', color: 'text-gray-500' };
    if (isSubscriptionActive()) return { status: 'Active', color: 'text-green-600' };
    return { status: 'Expired', color: 'text-red-600' };
  };

  const handleQuickAction = async (action: string, data?: { months?: number; [key: string]: unknown }) => {
    setProcessing(action);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action,
          data
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      if (result.success) {
        toast.success(result.message || 'User updated successfully!');
        payload?.onSuccess?.();
        closeModal();
      } else {
        throw new Error(result.error || 'Failed to update user');
      }

    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setProcessing(null);
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-lg font-semibold text-orange-800">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.fullName}</h3>
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

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Commissions</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(user.totalCommissions)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Direct Referrals</p>
                <p className="text-lg font-bold text-green-900">{user.directReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tier</p>
                <p className="text-lg font-bold text-purple-900">{user.tier}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            user.isVerified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  user.isVerified ? 'text-green-600' : 'text-red-600'
                }`}>Verification</p>
                <p className={`text-lg font-bold ${
                  user.isVerified ? 'text-green-900' : 'text-red-900'
                }`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
              {user.isVerified ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
            </div>
            
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Full Name:</span>
                <span className="text-sm text-gray-900">{user.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Username:</span>
                <span className="text-sm text-gray-900">@{user.username}</span>
              </div>
              <div className="flex justify-between">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="text-sm text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Phone:</span>
                <span className="text-sm text-gray-900">{user.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Tier:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTierColor(user.tier)}`}>
                  {user.tier}
                </span>
              </div>
              {user.role && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Role:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Joined:</span>
                <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900">Subscription Information</h4>
            </div>
            
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`text-sm font-medium ${subscriptionStatus.color}`}>
                  {subscriptionStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Start Date:</span>
                <span className="text-sm text-gray-900">{formatDate(user.subscriptionStartDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Expiry Date:</span>
                <span className="text-sm text-gray-900">{formatDate(user.subscriptionExpiryDate)}</span>
              </div>
              {user.subscriptionExpiryDate && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Days Left:</span>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(user.subscriptionExpiryDate)} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Quick Actions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Verification Actions */}
            {user.isVerified ? (
              <button
                onClick={() => handleQuickAction('unverify')}
                disabled={processing === 'unverify'}
                className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {processing === 'unverify' ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Unverify
              </button>
            ) : (
              <button
                onClick={() => handleQuickAction('verify')}
                disabled={processing === 'verify'}
                className="flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
              >
                {processing === 'verify' ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Verify
              </button>
            )}

            {/* Subscription Actions */}
            <button
              onClick={() => handleQuickAction('extend_subscription', { months: 1 })}
              disabled={processing === 'extend_subscription'}
              className="flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {processing === 'extend_subscription' ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Extend +1 Month
            </button>

            {isSubscriptionActive() && (
              <button
                onClick={() => handleQuickAction('revoke_subscription')}
                disabled={processing === 'revoke_subscription'}
                className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {processing === 'revoke_subscription' ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Revoke Access
              </button>
            )}

            {/* Edit User */}
            <button
              onClick={() => {
                closeModal();
                // Open edit modal
                setTimeout(() => {
                  payload?.onEdit?.(user);
                }, 100);
              }}
              className="flex items-center justify-center px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}