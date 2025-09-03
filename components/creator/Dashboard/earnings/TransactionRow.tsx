"use client"
import React from 'react';
import { DollarSign, Download } from 'lucide-react';
import { TransactionRowProps } from '@/types/Creatortypes/earnings';
import StatusBadge from './StatusBadge';

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const formatCurrency = (amount: number): string => 
    `₦${Math.abs(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateString: string): string => 
    new Date(dateString).toLocaleDateString('en-NG');

  const formatTime = (dateString: string): string => 
    new Date(dateString).toLocaleTimeString('en-NG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <Download className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getIconBgColor = (type: string): string => {
    return type === 'commission' ? 'bg-green-100' : 'bg-blue-100';
  };

  const getAmountColor = (type: string): string => {
    return type === 'withdrawal' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getIconBgColor(transaction.type)}`}>
            {getTransactionIcon(transaction.type)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {transaction.type === 'commission' ? 'Commission' : 'Withdrawal'}
            </div>
            <div className="text-xs text-gray-500">
              {transaction.type === 'commission' 
                ? `Order: ₦${transaction.orderValue.toLocaleString('en-NG')}` 
                : 'Payout to bank account'
              }
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-semibold ${getAmountColor(transaction.type)}`}>
          {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{transaction.customer}</div>
        <div className="text-xs text-gray-500">{transaction.referralCode}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
        <div className="text-xs text-gray-500">{formatTime(transaction.date)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={transaction.status} />
      </td>
    </tr>
  );
};

export default TransactionRow;