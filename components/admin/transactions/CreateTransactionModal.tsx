"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, User, DollarSign } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';

interface UserSearchResult {
  id: string;
  username: string;
  fullName: string;
  email: string;
  tier: string;
}

interface TransactionFormInputs {
  amount: number;
  type: 'COMMISSION' | 'BONUS' | 'SALE_COMMISSION' | 'MANUAL_ADJUSTMENT';
  triggerCommissions: boolean;
}

export default function CreateTransactionModal() {
  const { closeModal, payload } = useModal();
  
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<TransactionFormInputs>({
    defaultValues: {
      type: 'COMMISSION',
      triggerCommissions: false,
      amount: 0
    },
  });

  const watchedType = watch('type');

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length > 2) {
        setSearchLoading(true);
        try {
          const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}&limit=10`);
          const data = await response.json();
          
          if (data.success && data.data?.users) {
            setUsers(data.data.users);
          } else if (data.users) { 
            setUsers(data.users);
          } else {
            setUsers([]);
          }
        } catch (error) {
          console.error('User search error:', error);
          setUsers([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setUsers([]);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  const onSubmit: SubmitHandler<TransactionFormInputs> = async (data) => {
    if (!selectedUser) {
      toast.error('Please select a target user before submitting.');
      return;
    }

    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: selectedUser.id,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create transaction.');
      }

      if (result.success) {
        toast.success('Transaction created successfully!');
        payload?.onSuccess?.();
        closeModal();
      } else {
        throw new Error(result.error || 'Transaction creation failed');
      }

    } catch (err) {
      console.error('Transaction creation error:', err);
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const resetForm = () => {
    reset();
    setUserSearch('');
    setSelectedUser(null);
    setUsers([]);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Create Manual Transaction
        </h3>
        <button
          onClick={handleClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target User *
          </label>
          
          {!selectedUser ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by username, name, or email..."
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              {users.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearch('');
                        setUsers([]);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">
                        @{user.username} • {user.tier} • {user.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {searchLoading && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                  Searching users...
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUser.fullName}</div>
                  <div className="text-sm text-gray-500">@{selectedUser.username} • {selectedUser.tier}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type *
          </label>
          <select
            {...register('type', { required: 'Transaction type is required' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="COMMISSION">Commission</option>
            <option value="BONUS">Bonus</option>
            <option value="SALE_COMMISSION">Sale Commission</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₦) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required', 
                valueAsNumber: true, 
                min: { value: 0.01, message: "Amount must be positive" } 
              })}
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Trigger commissions checkbox - only show for relevant transaction types */}
        {(['SALE_COMMISSION', 'COMMISSION'].includes(watchedType)) && (
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="triggerCommissions"
              {...register('triggerCommissions')}
              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="triggerCommissions" className="text-sm font-medium text-gray-700">
                Trigger upstream commissions
              </label>
              <p className="text-xs text-gray-500 mt-1">
                This will automatically calculate and distribute commissions to upliners
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedUser || isSubmitting}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}