import React from 'react';
import { StatCardProps } from '@/types/Creatortypes/dashboard';

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconBgColor, 
  iconColor, 
  subtitle, 
  subtitleColor 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      {subtitle && (
        <div className={`mt-4 text-sm ${subtitleColor || 'text-gray-600'}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;