// components/admin/withdrawals/WithdrawalTable.tsx
"use client";

import React from 'react';
import { Eye, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
    withdrawalDetails: {
      bankName: string;
      firstName: string;
      lastName: string;
      accountNumber: string;
    } | null;
  };
}

interface WithdrawalTableProps {
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  processing: string | null;
  onViewWithdrawal: (withdrawal: WithdrawalRequest) => void;
  onUpdateStatus: (withdrawalId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
}

export default function WithdrawalTable({
  withdrawals,
  loading,
  processing,
  onViewWithdrawal,
  onUpdateStatus
}: WithdrawalTableProps) {

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
      case 'failed':
        return <X className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'silver':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      case 'bronze':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Withdrawal Requests</h3>
        </div>
        <div className="px-6 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No withdrawal requests found</h3>
          <p className="text-sm text-gray-500">No withdrawal requests match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Withdrawal Requests ({withdrawals.length})
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-800">
                          {withdrawal.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{withdrawal.user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(withdrawal.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {withdrawal.user.withdrawalDetails ? (
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{withdrawal.user.withdrawalDetails.bankName}</div>
                      <div className="text-gray-500">
                        {withdrawal.user.withdrawalDetails.accountNumber}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-red-500">No bank details</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-1 capitalize">{withdrawal.status.toLowerCase()}</span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTierColor(withdrawal.user.tier)}`}>
                      {withdrawal.user.tier}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formatDate(withdrawal.createdAt)}</div>
                  {withdrawal.updatedAt !== withdrawal.createdAt && (
                    <div className="text-xs text-gray-400">
                      Updated: {formatDate(withdrawal.updatedAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewWithdrawal(withdrawal)}
                      className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {withdrawal.status.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(withdrawal.id, 'APPROVED')}
                          disabled={processing === withdrawal.id}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(withdrawal.id, 'REJECTED')}
                          disabled={processing === withdrawal.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-800">
                      {withdrawal.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {withdrawal.user.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{withdrawal.user.username}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTierColor(withdrawal.user.tier)}`}>
                  {withdrawal.user.tier}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                  {getStatusIcon(withdrawal.status)}
                  <span className="ml-1 capitalize">{withdrawal.status.toLowerCase()}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="text-sm text-gray-900">{formatDate(withdrawal.createdAt)}</span>
              </div>
              {withdrawal.user.withdrawalDetails && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bank:</span>
                  <span className="text-sm text-gray-900">
                    {withdrawal.user.withdrawalDetails.bankName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onViewWithdrawal(withdrawal)}
                className="text-orange-600 hover:text-orange-900 p-2 rounded-md hover:bg-orange-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              {withdrawal.status.toLowerCase() === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(withdrawal.id, 'APPROVED')}
                    disabled={processing === withdrawal.id}
                    className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(withdrawal.id, 'REJECTED')}
                    disabled={processing === withdrawal.id}
                    className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}