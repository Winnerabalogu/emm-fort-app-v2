// components/admin/wordpress/WordPressSalesFilters.tsx
"use client";

import React from 'react';
import { Search, Filter, X, Calendar, Download } from 'lucide-react';

interface Filters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface WordPressSalesFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onApply: () => void;
  onClear: () => void;
  loading: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Sales' },
  { value: 'unprocessed', label: 'Unprocessed' },
  { value: 'processed', label: 'Processed' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending', label: 'Pending' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' }
];

export default function WordPressSalesFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  loading
}: WordPressSalesFiltersProps) {
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  const handleExport = () => {
    // Create CSV content from current filters
    console.log('Exporting with filters:', filters);
    // TODO: Implement export functionality
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Filter className="h-4 w-4" />
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        {/* Search */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Order ID, email, affiliate..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Date To */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {hasActiveFilters ? (
            <span>
              Filters applied. 
              <button
                onClick={onClear}
                className="ml-1 text-orange-600 hover:text-orange-800 font-medium"
              >
                Clear all
              </button>
            </span>
          ) : (
            'No active filters'
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500 mr-2">Quick filters:</span>
        
        <button
          onClick={() => {
            onFiltersChange({ ...filters, status: 'unprocessed' });
            setTimeout(onApply, 100);
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
        >
          Unprocessed
        </button>
        
        <button
          onClick={() => {
            onFiltersChange({ ...filters, status: 'completed' });
            setTimeout(onApply, 100);
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
        >
          Completed
        </button>
        
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            onFiltersChange({ ...filters, dateFrom: today, dateTo: today });
            setTimeout(onApply, 100);
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
        >
          Today
        </button>
        
        <button
          onClick={() => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const today = new Date();
            onFiltersChange({ 
              ...filters, 
              dateFrom: weekAgo.toISOString().split('T')[0],
              dateTo: today.toISOString().split('T')[0]
            });
            setTimeout(onApply, 100);
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
        >
          Last 7 Days
        </button>
      </div>
    </div>
  );
}