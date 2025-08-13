"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PiggyBank, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { Skeleton } from '@/components/ui/skeleton';

interface SaveRequest {
  id: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
  };
}

interface SavingsStats {
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
  rejected: { count: number; amount: number };
  total: { count: number; amount: number };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminSavingsPage() {
  const [saveRequests, setSaveRequests] = useState<SaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SavingsStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { openModal } = useModal();

  const fetchSaveRequests = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        search: searchQuery
      });

      const response = await fetch(`/api/admin/savings?${params}`);
      if (!response.ok) throw new Error('Failed to fetch save requests');

      const result = await response.json();
      if (result.success) {
        setSaveRequests(result.data.saveRequests);
        setPagination(result.data.pagination);
        setStats(result.data.stats);
        if (showToast) {
          toast.success('Save requests updated');
        }
      }
    } catch (error) {
      console.error('Fetch save requests error:', error);
      toast.error('Failed to load save requests');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/admin/savings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        fetchSaveRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Update save request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update save request');
    }
  };

  const handleViewDetails = (saveRequest: SaveRequest) => {
    openModal('VIEW_SAVE_REQUEST', { saveRequest });
  };

  useEffect(() => {
    fetchSaveRequests();
  }, [fetchSaveRequests]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Save Requests Management</h1>
          <p className="text-sm text-gray-500">Manage user saving requests and approvals</p>
        </div>
        <button
          onClick={() => fetchSaveRequests(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : stats ? (
          <>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total.count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.total.amount)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pending.count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.pending.amount)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-xl font-bold text-gray-900">{stats.approved.count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.approved.amount)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{stats.rejected.count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.rejected.amount)}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name, email, or purpose..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Requests Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </div>
        ) : saveRequests.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {saveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.user.fullName}</div>
                            <div className="text-sm text-gray-500">@{request.user.username}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTierColor(request.user.tier)}`}>
                              {request.user.tier}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DollarSign className="inline-block mr-1 h-4 w-4 text-gray-500" />
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(request.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={request.purpose}>
                          {request.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
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

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No save requests found</h3>
            <p className="text-gray-500">No save requests match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}