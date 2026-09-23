'use client';

import React, { useEffect } from 'react';
import { Transaction } from '@/types/transaction';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal Konfirmasi Hapus Transaksi (SRS-10)
 * Sesuai Design System: Tombol destructive merah (#DC2626), border-radius 6px, surface #FFFFFF.
 */
export default function DeleteConfirmModal({
  isOpen,
  transaction,
  isLoading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  // Shortcut Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !transaction) return null;

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-delete-title"
    >
      <div className="w-full max-w-md rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-md overflow-hidden text-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 id="modal-delete-title" className="text-lg font-semibold text-[#0F172A]">
            Hapus Transaksi
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#64748B]">
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          {/* Transaction Summary Preview */}
          <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs text-[#64748B]">
            <div className="flex justify-between items-center">
              <span className="font-medium text-[#0F172A]">{transaction.category}</span>
              <span
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Tanggal: {transaction.date}</span>
              <span className="capitalize">{transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
            </div>
            {transaction.description && (
              <p className="pt-1 text-[11px] text-[#64748B] border-t border-[#E2E8F0]/80 line-clamp-2">
                &ldquo;{transaction.description}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-[6px] border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#FFFFFF] hover:text-[#0F172A] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-[6px] bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading && (
              <svg
                className="w-4 h-4 animate-spin text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{isLoading ? 'Menghapus...' : 'Hapus Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
