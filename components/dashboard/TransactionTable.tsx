"use client";

import { useState, useMemo } from 'react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import EmptyState from '@/components/ui/EmptyState';
import { Receipt, Download, ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';

interface TransactionTableProps {
  transactions: Transaction[];
  title: string;
  isLoading?: boolean;
}

const getTransactionStyle = (type: TransactionType) => {
  switch (type) {
    case 'COMMISSION':
    case 'BONUS':
    case 'SUBSCRIPTION_FEE':
    case 'UPGRADE_FEE':
      return { Icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-100', sign: '+' };
    case 'WITHDRAWAL':
      return { Icon: ArrowDownLeft, color: 'text-red-600', bg: 'bg-red-100', sign: '-' };
    case 'SAVING':
      return { Icon: PiggyBank, color: 'text-indigo-600', bg: 'bg-indigo-100', sign: '' };
    default:
      return { Icon: Receipt, color: 'text-gray-600', bg: 'bg-gray-100', sign: '' };
  }
};

export default function TransactionTable({ transactions, title, isLoading = false }: TransactionTableProps) {
  const [filter, setFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type.toLowerCase() === filter);
  }, [transactions, filter]);

  const availableFilters = ['all', ...Array.from(new Set(transactions.map(t => t.type.toLowerCase())))];

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = "Transaction ID,Type,Status,Date,Amount (NGN)";
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type,
      t.status,
      `"${new Date(t.date).toLocaleString()}"`,
      t.amount
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔄 Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-6 py-4 text-left">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 📭 Show empty state when there's no data at all
  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          Icon={Receipt}
          message="No Transactions Yet"
          description="You have no transactions at the moment."
        />
      </div>
    );
  }

  // ✅ Render table when there's data
  return (
    <div className="bg-white rounded-2xl shadow-soft">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b gap-4">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full self-start sm:self-center">
          {availableFilters.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors ${
                filter === type ? 'bg-white shadow' : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const { Icon, color, bg, sign } = getTransactionStyle(t.type);
                return (
                  <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${bg}`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div>
                          <span className="capitalize">{t.type.toLowerCase()}</span>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          t.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold text-right ${color}`}>
                      {sign}
                      {formatNaira(t.amount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3}>
                  <div className="p-4">
                    <EmptyState
                      Icon={Receipt}
                      message="No Transactions Found"
                      description="No transactions match your current filter."
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
