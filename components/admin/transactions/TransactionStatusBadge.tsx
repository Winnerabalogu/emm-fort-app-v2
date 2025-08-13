// components/admin/transactions/TransactionStatusBadge.tsx
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface TransactionStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function TransactionStatusBadge({ status, size = 'sm' }: TransactionStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800',
          label: 'Completed'
        };
      case 'PENDING':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800',
          label: 'Pending'
        };
      case 'FAILED':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800',
          label: 'Failed'
        };
      case 'CANCELLED':
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800',
          label: 'Cancelled'
        };
      default:
        return {
          icon: Clock,
          className: 'bg-gray-100 text-gray-800',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center ${padding} rounded-full font-medium ${textSize} ${config.className}`}>
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </span>
  );
}