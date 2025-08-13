"use client";

import { useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { 
  X, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  LoaderCircle,
  Mail,
  Shield
} from 'lucide-react';

export default function ViewSaveRequestModal() {
  const { closeModal, payload } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  
  const saveRequest = payload?.saveRequest;
  if (!saveRequest) return null;

  const handleStatusUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/savings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: saveRequest.id, status })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        closeModal();
        // Trigger refresh if callback provided
        if (payload?.onSuccess) {
          payload.onSuccess();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Update save request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update save request');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-700 bg-green-100';
      case 'REJECTED': return 'text-red-700 bg-red-100';
      case 'PENDING': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'text-purple-700 bg-purple-100';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100';
      case 'SILVER': return 'text-gray-700 bg-gray-100';
      case 'BRONZE': return 'text-orange-700 bg-orange-100';
      default: return 'text-blue-700 bg-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Save Request Details</h2>
        <button 
          onClick={closeModal} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Request Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{formatCurrency(saveRequest.amount)}</h3>
              <p className="text-sm text-gray-500">Requested Amount</p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(saveRequest.status)}`}>
            {saveRequest.status}
          </span>
        </div>
      </div>

      {/* User Information */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <User className="h-5 w-5 mr-2" />
          User Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-sm text-gray-900">{saveRequest.user.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-sm text-gray-900">@{saveRequest.user.username}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </label>
              <p className="text-sm text-gray-900">{saveRequest.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Tier
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(saveRequest.user.tier)}`}>
                {saveRequest.user.tier}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Purpose */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Save Purpose
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-800">{saveRequest.purpose}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Timeline
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Request Created</p>
              <p className="text-sm text-gray-500">{formatDate(saveRequest.createdAt)}</p>
            </div>
          </div>
          {saveRequest.updatedAt !== saveRequest.createdAt && (
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-500">{formatDate(saveRequest.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {saveRequest.status === 'PENDING' && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={closeModal}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject Request
          </button>
          <button
            onClick={() => handleStatusUpdate('APPROVED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Approve Request
          </button>
        </div>
      )}

      {saveRequest.status !== 'PENDING' && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}