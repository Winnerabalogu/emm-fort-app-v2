/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/transactions/TransactionFilters.tsx
"use client";

import React from 'react';
import { Filter, Download, Calendar } from 'lucide-react';
import SearchFilter from '../common/SearchFilter';

interface TransactionFiltersProps {
  filters: {
    search: string;
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
  };
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  onExport: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'COMMISSION', label: 'Commission' },
  { value: 'BONUS', label: 'Bonus' },
  { value: 'SALE_COMMISSION', label: 'Sale Commission' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'SUBSCRIPTION_FEE', label: 'Subscription Fee' },
  { value: 'UPGRADE_FEE', label: 'Upgrade Fee' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'SAVING', label: 'Saving' }
];

export default function TransactionFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  onExport,
  loading = false
}: TransactionFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      
      {/* Search and quick actions row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <SearchFilter
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
          placeholder="Search by user, email, reference..."
          className="lg:max-w-md"
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Clear filters */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}