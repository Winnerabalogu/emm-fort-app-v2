// app/admin/wordpress-sales/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ShoppingCart, DollarSign, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import StatsCard from '@/components/admin/common/StatsCard';
import WordPressSalesFilters from '@/components/admin/wordpress/WordPressSalesFilters';
import WordPressSalesTable from '@/components/admin/wordpress/WordPressSalesTable';
import Pagination from '@/components/admin/common/Pagination';
import { ViewWordPressSaleModal } from '@/components/modals/ViewWordPressSaleModal';
import { AddWordPressSaleModal } from '@/components/modals/AddWordPressSaleModal';

interface WordPressSale {
  id: string;
  orderId: string;
  customerEmail: string;
  affiliateUsername?: string;
  amount: number;
  orderDate: string;
  status: string;
  processedAt?: string;
  description?: string;
  affiliate?: {
    id: string;
    fullName: string;
    username: string;
    tier: string;
  };
  createdAt: string;
}

interface SalesStats {
  processed: { count: number; amount: number };
  unprocessed: { count: number; amount: number };
  total: { count: number; amount: number };
}

interface ApiResponse {
  success: boolean;
  data: {
    sales: WordPressSale[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: SalesStats;
  };
}

export default function WordPressSalesDashboard() {
  const [sales, setSales] = useState<WordPressSale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<WordPressSale | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchSales = useCallback(async (page = pagination.page, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.status !== 'all' && { status: currentFilters.status }),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo })
      });

      const response = await fetch(`/api/admin/wordpress-sales?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch WordPress sales');
      }

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setSales(result.data.sales);
        setPagination(result.data.pagination);
        setStats(result.data.stats);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching WordPress sales:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  const handleApplyFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSales(1, filters);
  }, [filters, fetchSales]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = { search: '', status: 'all', dateFrom: '', dateTo: '' };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSales(1, clearedFilters);
  }, [fetchSales]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchSales(newPage);
  }, [fetchSales]);

  const handleViewSale = useCallback((sale: WordPressSale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  }, []);

  const handleAddSale = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedSale(null);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleSaleSuccess = useCallback(() => {
    fetchSales(pagination.page);
    toast.success('Sale processed successfully!');
  }, [fetchSales, pagination.page]);

  const handleProcessSales = async (selectedSales: WordPressSale[]) => {
    if (selectedSales.length === 0) {
      toast.error('Please select sales to process');
      return;
    }

    const unprocessedSales = selectedSales.filter(sale => !sale.processedAt);
    if (unprocessedSales.length === 0) {
      toast.error('Selected sales are already processed');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/wordpress-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sales: unprocessedSales.map(sale => ({
            orderId: sale.orderId,
            customerEmail: sale.customerEmail,
            affiliateUsername: sale.affiliateUsername,
            amount: sale.amount,
            orderDate: sale.orderDate,
            status: sale.status
          }))
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        fetchSales(pagination.page);
      } else {
        toast.error(result.error || 'Failed to process sales');
        if (result.data?.errors?.length > 0) {
          result.data.errors.slice(0, 3).forEach((error: string) => {
            toast.error(error, { duration: 5000 });
          });
        }
      }

    } catch (error) {
      console.error('Error processing sales:', error);
      toast.error('Failed to process sales');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessSingle = async (sale: WordPressSale) => {
    await handleProcessSales([sale]);
  };

  const handleBulkActions = async (action: string, selectedSales: WordPressSale[]) => {
    switch (action) {
      case 'process':
        await handleProcessSales(selectedSales);
        break;
      case 'export':
        handleExportSales(selectedSales);
        break;
      default:
        toast.error('Unknown action');
    }
  };

  const handleExportSales = (salesToExport: WordPressSale[]) => {
    try {
      const csvHeaders = [
        'Order ID', 'Customer Email', 'Affiliate', 'Amount', 'Status', 
        'Order Date', 'Processed', 'Description'
      ];
      
      const csvData = salesToExport.map(sale => [
        sale.orderId,
        sale.customerEmail,
        sale.affiliateUsername || 'N/A',
        sale.amount,
        sale.status,
        new Date(sale.orderDate).toLocaleString(),
        sale.processedAt ? 'Yes' : 'No',
        sale.description || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wordpress-sales-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Sales exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export sales');
    }
  };

useEffect(() => {
  fetchSales();
}, [fetchSales]);


  const unprocessedSales = sales.filter(sale => !sale.processedAt);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WordPress Sales Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and process affiliate sales from WordPress/WooCommerce integration.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddSale}
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Manual Sale
          </button>
          {unprocessedSales.length > 0 && (
            <button
              onClick={() => handleProcessSales(unprocessedSales)}
              disabled={processing}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {processing ? 'Processing...' : `Process All (${unprocessedSales.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sales"
          value={stats?.total.count ?? 0}
          subtitle={`₦${(stats?.total.amount ?? 0).toLocaleString()}`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Processed"
          value={stats?.processed.count ?? 0}
          subtitle={`₦${(stats?.processed.amount ?? 0).toLocaleString()}`}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Unprocessed"
          value={stats?.unprocessed.count ?? 0}
          subtitle={`₦${(stats?.unprocessed.amount ?? 0).toLocaleString()}`}
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Commission Pool"
          value={`₦${((stats?.processed.amount ?? 0) * 0.1).toLocaleString()}`}
          subtitle="From processed sales (10%)"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Filters */}
      <WordPressSalesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        loading={loading}
      />

      {/* Table */}
      <WordPressSalesTable
        sales={sales}
        loading={loading}
        processing={processing}
        onViewSale={handleViewSale}
        onProcessSale={handleProcessSingle}
        onBulkActions={handleBulkActions}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            totalCount={pagination.total}
            limit={pagination.limit}
          />
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">WordPress Integration Guide</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">Manage WordPress/WooCommerce sales and process affiliate commissions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                    <strong>Manual Entry:</strong> Add sales that couldn&apos;t sync automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                    <strong>Commission Processing:</strong> Calculate and distribute 10% commissions
                  </li>
                </ul>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                    <strong>Bulk Operations:</strong> Process multiple sales efficiently
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                    <strong>Status Tracking:</strong> Monitor processed vs unprocessed sales
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showViewModal && selectedSale && (
        <ViewWordPressSaleModal
          sale={selectedSale}
          onClose={handleCloseViewModal}
        />
      )}

      {showAddModal && (
        <AddWordPressSaleModal
          onClose={handleCloseAddModal}
          onSuccess={handleSaleSuccess}
        />
      )}

    </div>
  );
}