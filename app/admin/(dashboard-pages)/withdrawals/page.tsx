"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import StatsCard from '@/components/admin/common/StatsCard';
import WithdrawalFilters from '@/components/admin/withdrawals/WithdrawalFilters';
import WithdrawalTable from '@/components/admin/withdrawals/WithdrawalTable';
import Pagination from '@/components/admin/common/Pagination';
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
    withdrawalDetails: {
      bankName: string;
      firstName: string;
      lastName: string;
      accountNumber: string;
    } | null;
  };
}

interface WithdrawalStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    withdrawals: WithdrawalRequest[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  stats?: WithdrawalStats;
}

export default function WithdrawalsManagementPage() {
  const { openModal } = useModal();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchWithdrawals = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
      });

      const response = await fetch(`/api/admin/withdrawals?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch withdrawals');
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setWithdrawals(result.data.withdrawals);
        setPagination(result.data.pagination);
        if (result.stats) {
          setStats(result.stats);
        }
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch withdrawals');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]); 

  const handleApplyFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchWithdrawals(1, filters);
  }, [filters, fetchWithdrawals]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = { search: '', status: '', dateFrom: '', dateTo: '' };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchWithdrawals(1, clearedFilters);
  }, [fetchWithdrawals]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleViewWithdrawal = useCallback((withdrawal: WithdrawalRequest) => {
    openModal('VIEW_WITHDRAWAL', {
      withdrawal,
      onSuccess: () => fetchWithdrawals(pagination.page)
    });
  }, [openModal, fetchWithdrawals, pagination.page]);

  const handleUpdateStatus = useCallback(async (withdrawalId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setProcessing(withdrawalId);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update withdrawal status');
      }

      if (result.success) {
        toast.success(`Withdrawal ${status.toLowerCase()} successfully!`);
        fetchWithdrawals(pagination.page);
      } else {
        throw new Error(result.error || 'Failed to update withdrawal status');
      }

    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update withdrawal');
    } finally {
      setProcessing(null);
    }
  }, [fetchWithdrawals, pagination.page]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/admin/withdrawals/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `withdrawals-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Withdrawals exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export withdrawals');
    }
  };

  useEffect(() => {
    fetchWithdrawals(pagination.page);
  }, [fetchWithdrawals, pagination.page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and process user withdrawal requests.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatsCard
          title="Total Requests"
          value={stats?.totalRequests ?? 0}
          icon={TrendingDown}
          color="blue"
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingRequests ?? 0}
          subtitle={`₦${(stats?.pendingAmount ?? 0).toLocaleString()}`}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Completed"
          value={stats?.completedRequests ?? 0}
          subtitle={`₦${(stats?.completedAmount ?? 0).toLocaleString()}`}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Total Amount"
          value={`₦${(stats?.totalAmount ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats?.totalRequests ? ((stats.completedRequests / stats.totalRequests) * 100).toFixed(1) : 0}%`}
          icon={XCircle}
          color="purple"
        />
      </div>

      {/* Filters */}
      <WithdrawalFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onExport={handleExport}
        loading={loading}
      />

      {/* Withdrawals Table */}
      <WithdrawalTable
        withdrawals={withdrawals}
        loading={loading}
        processing={processing}
        onViewWithdrawal={handleViewWithdrawal}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalCount={pagination.totalCount}
            limit={pagination.limit}
          />
        </div>
      )}
    </div>
  );
}