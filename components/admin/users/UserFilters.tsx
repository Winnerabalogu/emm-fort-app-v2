/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Filter, UserPlus } from 'lucide-react';
import SearchFilter from '../common/SearchFilter';

interface UserFiltersProps {
  filters: {
    search: string;
    tier: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  onExport: () => void;
  onCreateUser: () => void;
  loading?: boolean;
}

const tierOptions = [
  { value: '', label: 'All Tiers' },
  { value: 'BASIC', label: 'Basic' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' }
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'active', label: 'Active Subscription' },
  { value: 'expired', label: 'Expired Subscription' }
];

export default function UserFilters({
  filters,
  onFiltersChange,
  onApply,
  onCreateUser,
  loading = false
}: UserFiltersProps) {

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      
      {/* Search and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <SearchFilter
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
          placeholder="Search by name, username, email, or phone..."
          className="lg:max-w-md"
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateUser}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </button>
          
          <button
            onClick={onApply}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Filter options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User Tier</label>
          <select
            value={filters.tier}
            onChange={(e) => updateFilter('tier', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {tierOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
