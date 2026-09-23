import React from 'react';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  className = '',
}) => {
  const styles = {
    success: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]',
    error: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
    warning: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
    info: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]',
  };

  return (
    <div
      role="alert"
      style={{ borderRadius: '6px' }}
      className={`border px-3.5 py-2.5 text-sm font-medium flex items-center gap-2 ${styles[type]} ${className}`}
    >
      <span>{message}</span>
    </div>
  );
};
