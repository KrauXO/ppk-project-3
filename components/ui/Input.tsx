import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          style={{ borderRadius: '6px' }}
          className={`w-full px-3 py-2 text-sm text-[#0F172A] bg-white border transition-colors outline-none placeholder:text-[#64748B] disabled:bg-[#F8FAFC] disabled:cursor-not-allowed ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
              : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[#DC2626] mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
