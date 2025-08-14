// components/admin/settings/SaveButton.tsx
import React from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function SaveButton({ 
  onClick, 
  loading = false, 
  disabled = false, 
  children, 
  variant = 'primary',
  size = 'md'
}: SaveButtonProps) {
  const baseClasses = "flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300";
  
  const variantClasses = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}