"use client"
import React from 'react';
import { StatusBadgeProps, TransactionStatus } from '@/types/Creatortypes/earnings';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: TransactionStatus): string => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      processing: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700'
    };
    
    return styles[status] || styles.pending;
  };

  const getStatusText = (status: TransactionStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;