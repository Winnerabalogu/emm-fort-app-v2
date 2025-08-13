"use client";

import React from 'react';
import { X, User, DollarSign, Calendar, Hash, FileText, TrendingUp, Users } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

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

export default function ViewTransactionModal() {
  const { closeModal, payload } = useModal();
  
  const transaction = payload?.transaction as Transaction;

  if (!transaction) {
    return (
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <p className="text-red-500">Transaction not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'commission':
      case 'sale_commission':
        return <TrendingUp className="h-4 w-4" />;
      case 'bonus':
        return <DollarSign className="h-4 w-4" />;
      case 'manual_adjustment':
        return <FileText className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
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

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            {getTypeIcon(transaction.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction Details
            </h3>
            <p className="text-sm text-gray-500">
              ID: {transaction.id}
            </p>
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
        
        {/* Transaction Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Amount</label>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Transaction Type
              </label>
              <p className="text-sm text-gray-900 capitalize">
                {transaction.type.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created At
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">User Information</h4>
          
          {/* Target User */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Transaction Recipient</h5>
                <p className="text-sm text-gray-500">User receiving this transaction</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{transaction.user.fullName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Username:</span>
                <p className="text-gray-900">@{transaction.user.username}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{transaction.user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Tier:</span>
                <p className="text-gray-900 capitalize">{transaction.user.tier.toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Source User (if exists) */}
          {transaction.sourceUser && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Transaction Source</h5>
                  <p className="text-sm text-gray-500">User who triggered this transaction</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{transaction.sourceUser.fullName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Username:</span>
                  <p className="text-gray-900">@{transaction.sourceUser.username}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-500">Tier:</span>
                  <p className="text-gray-900 capitalize">{transaction.sourceUser.tier.toLowerCase()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end p-6 border-t bg-gray-50">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}