"use client";

import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import { 
  X, 
  DollarSign, 
  User, 
  Search,
  LoaderCircle,
  Users,
  Gift
} from 'lucide-react';

interface UserOption {
  id: string;
  fullName: string;
  username: string;
  email: string;
  tier: string;
}

export default function CreateCommissionModal() {
  const { closeModal, payload } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [sourceUserSearch, setSourceUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [sourceUserOptions, setSourceUserOptions] = useState<UserOption[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingSourceUsers, setSearchingSourceUsers] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    type: 'COMMISSION' as 'COMMISSION' | 'BONUS',
    sourceUserId: '',
    description: ''
  });

  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedSourceUser, setSelectedSourceUser] = useState<UserOption | null>(null);

  // Search users
  const searchUsers = async (query: string, isSource = false) => {
    if (!query || query.length < 2) {
      if (isSource) setSourceUserOptions([]);
      else setUserOptions([]);
      return;
    }

    try {
      if (isSource) setSearchingSourceUsers(true);
      else setSearchingUsers(true);

      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) throw new Error('Failed to search users');

      const result = await response.json();
      if (result.success) {
        if (isSource) setSourceUserOptions(result.data.users);
        else setUserOptions(result.data.users);
      }
    } catch (error) {
      console.error('User search error:', error);
      toast.error('Failed to search users');
    } finally {
      if (isSource) setSearchingSourceUsers(false);
      else setSearchingUsers(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(userSearch, false);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(sourceUserSearch, true);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [sourceUserSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !formData.amount) {
      toast.error('Please select a user and enter an amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(formData.amount),
          type: formData.type,
          sourceUserId: selectedSourceUser?.id || undefined,
          description: formData.description || undefined
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        closeModal();
        if (payload?.onSuccess) {
          payload.onSuccess();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Create commission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create commission');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-gray-900">Create Manual Commission</h2>
        <button 
          onClick={closeModal} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Commission Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="COMMISSION"
                checked={formData.type === 'COMMISSION'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'COMMISSION' }))}
                className="mr-2"
              />
              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
              Commission
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="BONUS"
                checked={formData.type === 'BONUS'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'BONUS' }))}
                className="mr-2"
              />
              <Gift className="h-4 w-4 text-purple-600 mr-1" />
              Bonus
            </label>
          </div>
        </div>

        {/* Recipient User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient User <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for user..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {searchingUsers && (
              <LoaderCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Selected User Display */}
          {selectedUser && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-900">{selectedUser.fullName}</p>
                    <p className="text-sm text-green-700">@{selectedUser.username}</p>
                  </div>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(selectedUser.tier)}`}>
                    {selectedUser.tier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData(prev => ({ ...prev, userId: '' }));
                  }}
                  className="text-green-700 hover:text-green-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* User Options Dropdown */}
          {userOptions.length > 0 && !selectedUser && (
            <div className="mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
              {userOptions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setFormData(prev => ({ ...prev, userId: user.id }));
                    setUserSearch('');
                    setUserOptions([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">@{user.username} • {user.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(user.tier)}`}>
                    {user.tier}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₦) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* Source User (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source User (Optional)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for source user..."
              value={sourceUserSearch}
              onChange={(e) => setSourceUserSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {searchingSourceUsers && (
              <LoaderCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Selected Source User Display */}
          {selectedSourceUser && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedSourceUser.fullName}</p>
                    <p className="text-sm text-blue-700">@{selectedSourceUser.username}</p>
                  </div>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(selectedSourceUser.tier)}`}>
                    {selectedSourceUser.tier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSourceUser(null);
                    setFormData(prev => ({ ...prev, sourceUserId: '' }));
                  }}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Source User Options Dropdown */}
          {sourceUserOptions.length > 0 && !selectedSourceUser && (
            <div className="mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
              {sourceUserOptions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedSourceUser(user);
                    setFormData(prev => ({ ...prev, sourceUserId: user.id }));
                    setSourceUserSearch('');
                    setSourceUserOptions([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">@{user.username} • {user.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(user.tier)}`}>
                    {user.tier}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add a note about this commission..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModal}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedUser || !formData.amount}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Create {formData.type === 'COMMISSION' ? 'Commission' : 'Bonus'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}