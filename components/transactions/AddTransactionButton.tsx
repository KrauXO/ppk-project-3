'use client';

import React from 'react';

interface AddTransactionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Komponen tombol trigger "+ Tambah Transaksi"
 * Dibuat sesuai Design System (Bagian 6): Solid primary (#2563EB), radius 6px, ikon fungsional sederhana.
 */
export default function AddTransactionButton({
  onClick,
  disabled = false,
  className = '',
}: AddTransactionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-[6px] bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 transition-colors shadow-none cursor-pointer ${className}`}
      id="btn-add-transaction"
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>Tambah Transaksi</span>
    </button>
  );
}
