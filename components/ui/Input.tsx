"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, type, error, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    const toggleVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
          <input
            type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
            ref={ref}
            {...props}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none text-base sm:text-sm transition-colors ${
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {isPasswordVisible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          )}
          {error && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;