// components/admin/transactions/TransactionTypeBadge.tsx
import React from 'react';

interface TransactionTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export default function TransactionTypeBadge({ type, size = 'sm' }: TransactionTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'COMMISSION':
        return { className: 'bg-blue-100 text-blue-800', label: 'Commission' };
      case 'BONUS':
        return { className: 'bg-green-100 text-green-800', label: 'Bonus' };
      case 'SALE_COMMISSION':
        return { className: 'bg-purple-100 text-purple-800', label: 'Sale Commission' };
      case 'MANUAL_ADJUSTMENT':
        return { className: 'bg-orange-100 text-orange-800', label: 'Manual Adjustment' };
      case 'SUBSCRIPTION_FEE':
        return { className: 'bg-indigo-100 text-indigo-800', label: 'Subscription' };
      case 'UPGRADE_FEE':
        return { className: 'bg-pink-100 text-pink-800', label: 'Upgrade' };
      case 'WITHDRAWAL':
        return { className: 'bg-red-100 text-red-800', label: 'Withdrawal' };
      case 'SAVING':
        return { className: 'bg-teal-100 text-teal-800', label: 'Saving' };
      default:
        return { className: 'bg-gray-100 text-gray-800', label: type };
    }
  };

  const config = getTypeConfig(type);
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center ${padding} rounded-full font-medium ${textSize} ${config.className}`}>
      {config.label}
    </span>
  );
}