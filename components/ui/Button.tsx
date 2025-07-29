// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, isLoading = false, variant = 'primary', ...props }, ref) => {
    const baseClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
        primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
        secondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-500'
    };

    const disabledClasses = "disabled:bg-gray-300 disabled:cursor-not-allowed";

    return (
      <button
        ref={ref}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand"></div>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;