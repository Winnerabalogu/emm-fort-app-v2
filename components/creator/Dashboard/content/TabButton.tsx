import React from 'react';
import { TabButtonProps } from '@/types/Creatortypes/contentHub';

const TabButton: React.FC<TabButtonProps> = ({ id, label, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
};

export default TabButton;