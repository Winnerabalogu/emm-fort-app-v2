// components/modal/ViewWithdrawalModal.tsx
"use client";

import React, { useState } from 'react';
import { X, User, CreditCard, Clock, Check, XCircle, AlertTriangle } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';

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

export default function ViewWithdrawalModal() {
  const { closeModal, payload } = useModal();
  const [processing, setProcessing] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const withdrawal = payload?.withdrawal as WithdrawalRequest;

  if (!withdrawal) {
    return (
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <p className="text-red-500">Withdrawal not found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
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

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update withdrawal status');
      }

      if (result.success) {
        toast.success(`Withdrawal ${status.toLowerCase()} successfully!`);
        payload?.onSuccess?.();
        closeModal();
      } else {
        throw new Error(result.error || 'Failed to update withdrawal status');
      }

    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    handleUpdateStatus('REJECTED', rejectionReason);
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Withdrawal Request Details
        </h3>
        <button
          onClick={closeModal}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Status and Amount */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(withdrawal.amount)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Withdrawal Amount</div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
              {getStatusIcon(withdrawal.status)}
              <span className="ml-2 capitalize">{withdrawal.status.toLowerCase()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ID: {withdrawal.id.slice(-8)}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900">User Information</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{withdrawal.user.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <p className="mt-1 text-sm text-gray-900">@{withdrawal.user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{withdrawal.user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tier</label>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTierColor(withdrawal.user.tier)}`}>
                {withdrawal.user.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900">Bank Details</h4>
          </div>
          
          {withdrawal.user.withdrawalDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-500">Bank Name</label>
                <p className="mt-1 text-sm text-gray-900">{withdrawal.user.withdrawalDetails.bankName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Number</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{withdrawal.user.withdrawalDetails.accountNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Holder First Name</label>
                <p className="mt-1 text-sm text-gray-900">{withdrawal.user.withdrawalDetails.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Holder Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{withdrawal.user.withdrawalDetails.lastName}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 font-medium">No bank details available</span>
              </div>
              <p className="text-sm text-red-600 mt-1">User has not provided withdrawal bank details.</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Request Created</p>
                <p className="text-xs text-blue-700">{formatDate(withdrawal.createdAt)}</p>
              </div>
            </div>
            
            {withdrawal.updatedAt !== withdrawal.createdAt && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-xs text-gray-700">{formatDate(withdrawal.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason Input */}
        {showReasonInput && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Please provide a clear reason for rejecting this withdrawal request..."
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {withdrawal.status.toLowerCase() === 'pending' && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {!showReasonInput ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={processing || !withdrawal.user.withdrawalDetails}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Processing...' : 'Approve Withdrawal'}
              </button>
              <button
                onClick={() => setShowReasonInput(true)}
                disabled={processing}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Reject Withdrawal
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReasonInput(false);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          )}
          
          {!withdrawal.user.withdrawalDetails && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Cannot approve: User has not provided bank details
            </p>
          )}
        </div>
      )}
    </div>
  );
}