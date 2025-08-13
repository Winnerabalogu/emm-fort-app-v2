// components/admin/wordpress/WordPressSalesTable.tsx
"use client";

import React, { useState } from 'react';
import { Eye, Play, CheckCircle, User, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import DataTable from '../common/DataTable';

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

interface WordPressSalesTableProps {
  sales: WordPressSale[];
  loading?: boolean;
  processing?: boolean;
  onViewSale: (sale: WordPressSale) => void;
  onProcessSale: (sale: WordPressSale) => void;
  onBulkActions: (action: string, selectedSales: WordPressSale[]) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' };
      case 'on-hold':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'On Hold' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' };
      case 'refunded':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Refunded' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const TierBadge = ({ tier }: { tier: string }) => {
  const getTierConfig = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'DIAMOND':
        return { color: 'bg-purple-100 text-purple-800', label: 'Diamond' };
      case 'GOLD':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Gold' };
      case 'SILVER':
        return { color: 'bg-gray-100 text-gray-800', label: 'Silver' };
      case 'BRONZE':
        return { color: 'bg-orange-100 text-orange-800', label: 'Bronze' };
      default:
        return { color: 'bg-blue-100 text-blue-800', label: 'Basic' };
    }
  };

  const config = getTierConfig(tier);
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function WordPressSalesTable({
  sales,
  loading = false,
  processing = false,
  onViewSale,
  onProcessSale,
  onBulkActions
}: WordPressSalesTableProps) {
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSales(new Set(sales.map(sale => sale.id)));
    } else {
      setSelectedSales(new Set());
    }
  };

  const handleSelectSale = (saleId: string, checked: boolean) => {
    const newSelection = new Set(selectedSales);
    if (checked) {
      newSelection.add(saleId);
    } else {
      newSelection.delete(saleId);
    }
    setSelectedSales(newSelection);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedSales.size === 0) return;
    
    const selectedSaleObjects = sales.filter(sale => selectedSales.has(sale.id));
    onBulkActions(bulkAction, selectedSaleObjects);
    
    // Clear selection and reset action
    setSelectedSales(new Set());
    setBulkAction('');
  };

  const isProcessed = (sale: WordPressSale) => {
    return sale.processedAt !== null || sale.status === 'completed';
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedSales.size === sales.length && sales.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
      ),
      render: (_: WordPressSale[keyof WordPressSale] | undefined, row: WordPressSale) => (
        <input
          type="checkbox"
          checked={selectedSales.has(row.id)}
          onChange={(e) => handleSelectSale(row.id, e.target.checked)}
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
      )
    },
    {
      key: 'orderId' as keyof WordPressSale,
      label: 'Order',
      render: (value: WordPressSale[keyof WordPressSale] | undefined, row: WordPressSale) => (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              #{value as string}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(row.orderDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'customerEmail' as keyof WordPressSale,
      label: 'Customer',
      render: (email: WordPressSale[keyof WordPressSale] | undefined) => (
        <div>
          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {email as string}
          </div>
        </div>
      )
    },
    {
      key: 'affiliate' as keyof WordPressSale,
      label: 'Affiliate',
      render: (affiliate: WordPressSale[keyof WordPressSale] | undefined, row: WordPressSale) => {
        const affiliateData = affiliate as WordPressSale['affiliate'];
        
        if (!affiliateData && !row.affiliateUsername) {
          return (
            <span className="text-xs text-gray-500 italic">No affiliate</span>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {affiliateData?.fullName || row.affiliateUsername || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                @{affiliateData?.username || row.affiliateUsername}
                {affiliateData?.tier && <TierBadge tier={affiliateData.tier} />}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'amount' as keyof WordPressSale,
      label: 'Amount',
      render: (amount: WordPressSale[keyof WordPressSale] | undefined) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            ₦{(amount as number).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'status' as keyof WordPressSale,
      label: 'Status',
      render: (status: WordPressSale[keyof WordPressSale] | undefined, row: WordPressSale) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={status as string} />
          {isProcessed(row) && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">Processed</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'orderDate' as keyof WordPressSale,
      label: 'Date',
      render: (orderDate: WordPressSale[keyof WordPressSale] | undefined) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-sm text-gray-900">
              {new Date(orderDate as string).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(orderDate as string).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: WordPressSale[keyof WordPressSale] | undefined, row: WordPressSale) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewSale(row)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {!isProcessed(row) && (
            <button
              onClick={() => onProcessSale(row)}
              disabled={processing}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Process commission"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedSales.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-orange-800">
              <strong>{selectedSales.size}</strong> sale{selectedSales.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-orange-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Choose action</option>
                <option value="process">Process Commissions</option>
                <option value="export">Export Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || processing}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        emptyMessage="No WordPress sales found"
        emptyDescription="Sales from your WordPress/WooCommerce store will appear here."
      />

      {/* Summary */}
      {sales.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Sales:</span>
              <span className="font-medium text-gray-900">{sales.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-gray-900">
                ₦{sales.reduce((sum, sale) => sum + sale.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Processed:</span>
              <span className="font-medium text-gray-900">
                {sales.filter(sale => isProcessed(sale)).length} / {sales.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}