"use client"
import React from 'react';
import { Download } from 'lucide-react';
import { TransactionTableProps, TransactionFilter } from '@/types/Creatortypes/earnings';
import TransactionRow from './TransactionRow';

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  filterType,
  onFilterChange,
  onExport,
  currentPage,
  totalPages,
  totalTransactions,
  onPageChange
}) => {
  const filterOptions: { value: TransactionFilter; label: string }[] = [
    { value: 'all', label: 'All Transactions' },
    { value: 'commission', label: 'Commission Only' },
    { value: 'withdrawal', label: 'Withdrawals Only' }
  ];

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getDisplayedTransactionsInfo = (): string => {
    const startIndex = (currentPage - 1) * 5 + 1;
    const endIndex = Math.min(currentPage * 5, totalTransactions);
    return `Showing ${startIndex}-${endIndex} of ${totalTransactions} transactions`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value as TransactionFilter)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button 
              onClick={onExport}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer/Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer/Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {getDisplayedTransactionsInfo()}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                    page === currentPage
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="text-center py-12">
          <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h4>
          <p className="text-gray-600">
            {filterType === 'all' 
              ? 'You haven\'t made any transactions yet.' 
              : `No ${filterType} transactions found for the selected filter.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;