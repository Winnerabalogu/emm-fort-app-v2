/* eslint-disable react/no-unescaped-entities */
"use client";

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
  };
  sourceUser?: {
    id: string;
    fullName: string;
    username: string;
    tier: string;
  };
}

interface EditFormInputs {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export default function EditTransactionModal() {
  const { closeModal, payload } = useModal();
  
  const transaction = payload?.transaction as Transaction;

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }
  } = useForm<EditFormInputs>({
    defaultValues: {
      status: transaction?.status as EditFormInputs['status'] || 'PENDING'
    }
  });

  if (!transaction) {
    return (
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <p className="text-red-500">Transaction not found</p>
      </div>
    );
  }

  const onSubmit: SubmitHandler<EditFormInputs> = async (data) => {
    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          status: data.status
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update transaction');
      }

      if (result.success) {
        toast.success('Transaction updated successfully!');
        payload?.onSuccess?.();
        closeModal();
      } else {
        throw new Error(result.error || 'Transaction update failed');
      }

    } catch (err) {
      console.error('Transaction update error:', err);
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Transaction
        </h3>
        <button
          onClick={closeModal}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Transaction Summary */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Type:</span>
            <span className="text-sm text-gray-900 capitalize">
              {transaction.type.replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">User:</span>
            <span className="text-sm text-gray-900">{transaction.user.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Created:</span>
            <span className="text-sm text-gray-900">{formatDate(transaction.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Current Status:</span>
            <span className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status *
          </label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Warning for status changes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Changing status to "Failed&quot; or "Cancelled" may affect user balances</li>
                <li>Status changes are irreversible and will be logged</li>
                <li>Consider the impact on commission calculations before changing</li>
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
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}