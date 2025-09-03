"use client"
import React from 'react';
import EarningsChart from './EarningsChart';
import OrdersChart from './OrdersChart';
import { ChartsGridProps } from '@/types/Creatortypes/earnings';

const ChartsGrid: React.FC<ChartsGridProps> = ({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <EarningsChart 
        data={data}
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
      />
      <OrdersChart data={data} />
    </div>
  );
};

export default ChartsGrid;