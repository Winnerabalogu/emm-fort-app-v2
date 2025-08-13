"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, DollarSign, Activity, Users } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import StatsCard from '@/components/admin/common/StatsCard';
import TransactionFilters from '@/components/admin/transactions/TransactionFilters';
import TransactionTable from '@/components/admin/transactions/TransactionTable';
import Pagination from '@/components/admin/common/Pagination';
import { toast } from "sonner";

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

interface TransactionStats {
  totalCount: number;
  totalAmount: number;
  byStatus: {
    COMPLETED?: { count: number; amount: number };
    PENDING?: { count: number; amount: number };
    FAILED?: { count: number; amount: number };
    CANCELLED?: { count: number; amount: number };
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  summary?: TransactionStats;
}

export default function AdminTransactionDashboard() {
  const { openModal } = useModal();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
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

  const fetchTransactions = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.type && { type: currentFilters.type }),
        ...(currentFilters.search && { userId: currentFilters.search }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
      });

      const response = await fetch(`/api/admin/transactions?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setTransactions(result.data.transactions);
        setPagination(result.data.pagination);
        if (result.summary) {
          setStats(result.summary);
        }
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]); 

  const handleApplyFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions(1, filters);
  }, [filters, fetchTransactions]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = { search: '', status: '', type: '', dateFrom: '', dateTo: '' };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions(1, clearedFilters);
  }, [fetchTransactions]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const openCreateTransactionModal = useCallback(() => {
    openModal('CREATE_TRANSACTION', {
      onSuccess: () => fetchTransactions(pagination.page)
    });
  }, [openModal, fetchTransactions, pagination.page]);

  const handleViewTransaction = useCallback((transaction: Transaction) => {
    openModal('VIEW_TRANSACTION', {
      transaction,
      onSuccess: () => fetchTransactions(pagination.page)
    });
  }, [openModal, fetchTransactions, pagination.page]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    openModal('EDIT_TRANSACTION', {
      transaction,
      onSuccess: () => fetchTransactions(pagination.page)
    });
  }, [openModal, fetchTransactions, pagination.page]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/admin/transactions/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  useEffect(() => {
    fetchTransactions(pagination.page);
  }, [fetchTransactions, pagination.page]);

  return (    
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage all affiliate system transactions.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={openCreateTransactionModal}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title="Total Transactions"
            value={stats?.totalCount ?? 0}
            icon={Activity}
            color="blue"
          />
          <StatsCard
            title="Total Volume"
            value={`₦${(stats?.totalAmount ?? 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Completed"
            value={stats?.byStatus.COMPLETED?.count ?? 0}
            subtitle={`₦${(stats?.byStatus.COMPLETED?.amount ?? 0).toLocaleString()}`}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title="Pending"
            value={stats?.byStatus.PENDING?.count ?? 0}
            subtitle={`₦${(stats?.byStatus.PENDING?.amount ?? 0).toLocaleString()}`}
            icon={Users}
            color="orange"
          />
        </div>

        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onExport={handleExport}
          loading={loading}
        />

        <TransactionTable
          transactions={transactions}
          loading={loading}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
        />

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