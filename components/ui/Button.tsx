import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'destructive';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium text-sm transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Design system strict styling (radius: 6px, padding 8-10px equivalent)
  const variantStyles = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]',
    outline: 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]',
    destructive: 'bg-[#DC2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b]',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{ borderRadius: '6px' }}
      className={`${baseStyles} ${variantStyles[variant]} px-4 py-2 ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
