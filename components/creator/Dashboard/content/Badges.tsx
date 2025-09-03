import React from 'react';

export const EngagementBadge: React.FC<{ engagement: string }> = ({ engagement }) => {
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'bg-purple-100 text-purple-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(engagement)}`}>
      {engagement}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
      {difficulty}
    </span>
  );
};