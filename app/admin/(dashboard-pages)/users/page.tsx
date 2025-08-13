"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, UserX, DollarSign, Calendar } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import StatsCard from '@/components/admin/common/StatsCard';
import UserFilters from '@/components/admin/users/UserFilters';
import UserTable from '@/components/admin/users/UserTable';
import Pagination from '@/components/admin/common/Pagination';
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  tier: string;
  isVerified: boolean;
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
  createdAt: string;
  totalCommissions: number;
  directReferrals: number;
}

interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  activeSubscribers: number;
  totalCommissions: number;
  newUsersThisMonth: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  stats?: UserStats;
}

export default function UsersManagementPage() {
  const { openModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tier: '',
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

  const fetchUsers = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.tier && { tier: currentFilters.tier }),
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
        if (result.stats) {
          setStats(result.stats);
        }
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]); 

  const handleApplyFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers(1, filters);
  }, [filters, fetchUsers]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = { search: '', tier: '', status: '', dateFrom: '', dateTo: '' };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers(1, clearedFilters);
  }, [fetchUsers]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleCreateUser = useCallback(() => {
    openModal('CREATE_USER', {
      onSuccess: () => fetchUsers(pagination.page)
    });
  }, [openModal, fetchUsers, pagination.page]);

  const handleViewUser = useCallback((user: User) => {
    openModal('VIEW_USER', {
      user,
      onSuccess: () => fetchUsers(pagination.page)
    });
  }, [openModal, fetchUsers, pagination.page]);

  const handleEditUser = useCallback((user: User) => {
    openModal('EDIT_USER', {
      user,
      onSuccess: () => fetchUsers(pagination.page)
    });
  }, [openModal, fetchUsers, pagination.page]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(filters.search && { search: filters.search }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/admin/users/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all registered users and their account details.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Verified Users"
          value={stats?.verifiedUsers ?? 0}
          subtitle={`${((stats?.verifiedUsers ?? 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% verified`}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Active Subscribers"
          value={stats?.activeSubscribers ?? 0}
          subtitle={`${((stats?.activeSubscribers ?? 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% subscribed`}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Total Commissions"
          value={`₦${(stats?.totalCommissions ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="orange"
        />
        <StatsCard
          title="New This Month"
          value={stats?.newUsersThisMonth ?? 0}
          icon={UserX}
          color="purple"
        />
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onExport={handleExport}
        onCreateUser={handleCreateUser}
        loading={loading}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
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