"use client";

import { useState, useMemo, SetStateAction } from 'react';
import { Transaction } from '@/lib/types';
import  Input  from '@/components/ui/Input';
import  Button  from '@/components/ui/Button';
import { Download, Search } from 'lucide-react';

interface TransactionsTableProps {
  initialTransactions: Transaction[];
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

// Helper for styling transaction types
const getTransactionTypeBadge = (type: string) => {
  switch (type.toUpperCase()) {
    case 'COMMISSION':
      return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Commission</span>;
    case 'BONUS':
      return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Bonus</span>;
    case 'WITHDRAWAL':
      return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Withdrawal</span>;
    case 'SUBSCRIPTION_FEE':
    case 'UPGRADE_FEE':
      return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Fee</span>;
    case 'UPGRADE_DOWNLINE':
      return <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">Upgrade</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{type}</span>;
  }
};

export default function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions based on the search term. `useMemo` optimizes this.
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return initialTransactions;
    return initialTransactions.filter(tx =>
      tx.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initialTransactions]);

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    // Define CSV headers
    const headers = ['Date', 'Type', 'Amount (NGN)', 'Status'];
    // Map data to CSV format
    const rows = filteredTransactions.map(tx => [
      `"${new Date(tx.date).toLocaleString()}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.status}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'transactions-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Toolbar for Search and Export */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
                      type="text"
                      placeholder="Search by type..."
                      value={searchTerm}
                      onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
                      className="pl-10" label={''}          />
        </div>
        <Button onClick={handleExport} variant="primary" className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTransactionTypeBadge(tx.type)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.amount < 0 || tx.type.includes('FEE') || tx.type.includes('WITHDRAWAL') ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}