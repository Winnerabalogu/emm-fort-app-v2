"use client"
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { EarningsSummaryCardProps } from '@/types/Creatortypes/earnings';

const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  subtitle,
  subtitleIcon: SubtitleIcon,
  subtitleColor,
  trend,
  trendValue
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className={`flex items-center gap-1 text-sm ${subtitleColor}`}>
          <SubtitleIcon className="h-4 w-4" />
          <span>{subtitle}</span>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsSummaryCard;