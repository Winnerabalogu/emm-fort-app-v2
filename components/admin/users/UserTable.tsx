"use client";

import React from 'react';
import { Eye, Edit, Calendar, DollarSign, Users, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
}

export default function UserTable({ users, loading, onViewUser, onEditUser }: UserTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-gray-100 text-gray-800';
      case 'BRONZE':
        return 'bg-orange-100 text-orange-800';
      case 'SILVER':
        return 'bg-blue-100 text-blue-800';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatus = (startDate: string | null, expiryDate: string | null) => {
    if (!startDate || !expiryDate) {
      return { status: 'No Subscription', color: 'bg-gray-100 text-gray-800' };
    }

    const now = new Date();
    const expiry = new Date(expiryDate);

    if (expiry > now) {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search filters to find users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const subscriptionStatus = getSubscriptionStatus(user.subscriptionStartDate, user.subscriptionExpiryDate);
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phoneNumber || 'No phone'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.tier)}`}>
                        {user.tier}
                      </span>
                      <div className="flex items-center">
                        {user.isVerified ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            <span className="text-xs">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="h-3 w-3 mr-1" />
                            <span className="text-xs">Unverified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionStatus.color}`}>
                        {subscriptionStatus.status}
                      </span>
                      {user.subscriptionExpiryDate && (
                        <div className="text-xs text-gray-500">
                          Expires: {formatDate(user.subscriptionExpiryDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(user.totalCommissions)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {user.directReferrals} referrals
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onViewUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        title="View User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded-md hover:bg-orange-50 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}