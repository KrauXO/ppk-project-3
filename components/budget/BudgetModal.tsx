'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MonthlyBudget } from '@/types/budget';
import { formatCurrency, useBalanceFormatPreference } from '@/lib/cookie-preference';

export interface BudgetModalProps {
  isOpen: boolean;
  userId: string;
  currentMonth?: string;
  initialAmount?: number | null;
  onClose: () => void;
  onSuccess?: (budget: MonthlyBudget, message: string) => void;
}

interface BudgetFormInnerProps {
  userId: string;
  currentMonth: string;
  initialAmount?: number | null;
  onClose: () => void;
  onSuccess?: (budget: MonthlyBudget, message: string) => void;
}

function BudgetFormInner({
  userId,
  currentMonth,
  initialAmount,
  onClose,
  onSuccess,
}: BudgetFormInnerProps) {
  const [month, setMonth] = useState<string>(currentMonth);
  const [amount, setAmount] = useState<string>(
    initialAmount && initialAmount > 0 ? String(initialAmount) : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [balanceFormat] = useBalanceFormatPreference();
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  const numAmount = parseFloat(amount);
  const formattedPreview =
    !isNaN(numAmount) && numAmount > 0 ? formatCurrency(numAmount, balanceFormat) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi Periode Bulan
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!month || !monthRegex.test(month)) {
      setErrorMessage('Pilih periode bulan yang valid (YYYY-MM).');
      return;
    }

    // Validasi Nominal Anggaran (SRS-12: nominal > 0)
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMessage('Nominal anggaran bulanan harus berupa angka lebih besar dari 0.');
      amountInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          month,
          amount: finalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gagal menyimpan anggaran bulanan.');
      }

      if (onSuccess) {
        onSuccess(result.data, result.message || 'Anggaran bulanan berhasil disimpan.');
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan anggaran.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-md overflow-hidden text-[#0F172A]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <div>
          <h2 id="modal-budget-title" className="text-xl font-semibold text-[#0F172A]">
            {initialAmount && initialAmount > 0 ? 'Ubah Budget Bulanan' : 'Atur Budget Bulanan'}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tetapkan batas pengeluaran untuk mengendalikan keuangan (SRS-12)
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Tutup form modal"
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Error Notification */}
        {errorMessage && (
          <div
            className="p-3 text-sm rounded-[6px] bg-red-50 border border-[#DC2626]/20 text-[#DC2626] flex items-start gap-2"
            role="alert"
          >
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Periode Bulan (YYYY-MM) */}
        <div>
          <label htmlFor="budget-month" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Periode Bulan <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="budget-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={isLoading}
            required
            className="w-full px-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
          />
          <p className="text-xs text-[#64748B] mt-1">
            Format: YYYY-MM (misal: 2025-02 untuk Februari 2025)
          </p>
        </div>

        {/* 2. Nominal Anggaran (Amount) */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label htmlFor="budget-amount" className="text-sm font-medium text-[#0F172A]">
              Nominal Anggaran (Rp) <span className="text-[#DC2626]">*</span>
            </label>
            {formattedPreview && (
              <span className="text-xs font-semibold text-[#2563EB]">{formattedPreview}</span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium pointer-events-none">
              Rp
            </span>
            <input
              id="budget-amount"
              ref={amountInputRef}
              type="number"
              min="1"
              step="any"
              placeholder="misal: 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              required
              className="w-full pl-10 pr-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-[6px] border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-[6px] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
            <span>{isLoading ? 'Menyimpan...' : 'Simpan Budget'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BudgetModal({
  isOpen,
  userId,
  currentMonth = '2025-02',
  initialAmount = null,
  onClose,
  onSuccess,
}: BudgetModalProps) {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-budget-title"
    >
      <BudgetFormInner
        key={`${userId}-${currentMonth}-${initialAmount || 0}`}
        userId={userId}
        currentMonth={currentMonth}
        initialAmount={initialAmount}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
