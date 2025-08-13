/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/transactions/TransactionTable.tsx
"use client";

import React from 'react';
import { Eye, Edit, User, ArrowUpRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import TransactionStatusBadge from './TransactionStatusBadge';
import TransactionTypeBadge from './TransactionTypeBadge';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
  referenceId?: string;
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

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onViewTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  loading = false,
  onViewTransaction,
  onEditTransaction
}: TransactionTableProps) {
  const columns = [
    {
      key: 'id' as keyof Transaction,
      label: 'Transaction',
      render: (value: string, row: Transaction) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            #{value.slice(-8)}
          </div>
          {row.referenceId && (
            <div className="text-xs text-gray-500">
              Ref: {row.referenceId}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'user' as keyof Transaction,
      label: 'User',
      render: (user: Transaction['user']) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.fullName}
            </div>
            <div className="text-sm text-gray-500">
              @{user.username} • {user.tier}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type' as keyof Transaction,
      label: 'Type',
      render: (type: string) => <TransactionTypeBadge type={type} />
    },
    {
      key: 'amount' as keyof Transaction,
      label: 'Amount',
      render: (amount: number, row: Transaction) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            ₦{amount.toLocaleString()}
          </div>
          {row.sourceUser && (
            <div className="text-xs text-gray-500 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              From: {row.sourceUser.fullName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof Transaction,
      label: 'Status',
      render: (status: string) => <TransactionStatusBadge status={status} />
    },
    {
      key: 'createdAt' as keyof Transaction,
      label: 'Date',
      render: (createdAt: string) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions' as keyof Transaction,
      label: 'Actions',
      render: (_: any, row: Transaction) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewTransaction(row)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEditTransaction(row)}
            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit transaction"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={loading}
      emptyMessage="No transactions found"
    />
  );
}