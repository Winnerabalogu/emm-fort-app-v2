"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Eye,
  User,
  Calendar,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CommissionStatsCards } from '@/components/admin/commissions/CommissionStatsCards';
import { CommissionFilters } from '@/components/admin/commissions/CommissionFilters';
import { TopEarnersCard } from '@/components/admin/commissions/TopEarnersCard';

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

interface CommissionStats {
  totalCommissions: number;
  totalCount: number;
  topEarners: Array<{
    user: {
      id: string;
      fullName: string;
      username: string;
      tier: string;
    } | null;
    totalCommissions: number;
    transactionCount: number;
  }>;
  typeBreakdown: Record<string, { count: number; amount: number }>;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { openModal } = useModal();

  const fetchCommissions = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/commissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch commissions');

      const result = await response.json();
      if (result.success) {
        setCommissions(result.data.commissions);
        setPagination(result.data.pagination);
        setStats(result.data.stats);
        if (showToast) {
          toast.success('Commissions data updated');
        }
      }
    } catch (error) {
      console.error('Fetch commissions error:', error);
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, searchQuery, dateFrom, dateTo]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateCommission = () => {
    openModal('CREATE_COMMISSION', { 
      onSuccess: () => fetchCommissions(true) 
    });
  };

  const handleViewTransaction = (transaction: Transaction) => {
    openModal('VIEW_TRANSACTION', { transaction });
  };

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMMISSION': return 'text-green-700 bg-green-100';
      case 'BONUS': return 'text-purple-700 bg-purple-100';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-sm text-gray-500">Track and manage affiliate commissions and bonuses</p>
        </div>
        <button
          onClick={() => fetchCommissions(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <CommissionStatsCards stats={stats} loading={loading} />

      {/* Two Column Layout - Better proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content - Commission Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <CommissionFilters
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onSearch={handleSearch}
            onCreateCommission={handleCreateCommission}
          />

          {/* Commission Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            {loading ? (
              <div className="p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full mb-4" />
                ))}
              </div>
            ) : commissions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-10 w-10 text-gray-400 mr-4" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{commission.user.fullName}</div>
                                <div className="text-sm text-gray-500 mb-1">@{commission.user.username}</div>
                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getTierColor(commission.user.tier)}`}>
                                  {commission.user.tier}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full ${getTypeColor(commission.type)}`}>
                              {commission.type}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm font-semibold text-gray-900">{formatCurrency(commission.amount)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {commission.sourceUser ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{commission.sourceUser.fullName}</p>
                                <p className="text-gray-500">@{commission.sourceUser.username}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">System Generated</span>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(commission.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewTransaction(commission)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-md"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
                          className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions found</h3>
                <p className="text-gray-500">No commission transactions match your current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Top Earners */}
        <div className="lg:col-span-4">
          <TopEarnersCard 
            topEarners={stats?.topEarners || []} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
}