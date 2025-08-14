import React from 'react';
import { PieChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TierData {
  tier: string;
  count: number;
  percentage: number;
}

interface UserTierChartProps {
  data: TierData[];
  loading?: boolean;
}

const UserTierChart: React.FC<UserTierChartProps> = ({ data, loading }) => {
  const colors: Record<string, string> = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0', 
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2'
  };

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">No Data Available</p>
          <p className="text-sm text-gray-500">No user tier data to display</p>
        </div>
      </div>
    );
  }

  // Calculate cumulative angles for the pie chart
  let cumulativePercentage = 0;
  const processedData = data.map(item => {
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    
    return {
      ...item,
      startAngle,
      endAngle,
      color: colors[item.tier] || '#6B7280'
    };
  });

  // SVG pie chart using path elements
  const createPieSlice = (startAngle: number, endAngle: number, color: string) => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="space-y-6">
      {/* SVG Pie Chart */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {processedData.map((item) => (
              <path
                key={item.tier}
                d={createPieSlice(item.startAngle, item.endAngle, item.color)}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </svg>
          
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {processedData.map((item) => (
          <div key={item.tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-gray-700 capitalize">
                {item.tier.toLowerCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{item.count}</div>
              <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {processedData.length}
          </div>
          <div className="text-sm text-gray-500">Active Tiers</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {Math.max(...data.map(d => d.percentage)).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Largest Tier</div>
        </div>
      </div>
    </div>
  );
};

export default UserTierChart;