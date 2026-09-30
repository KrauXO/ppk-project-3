'use client';

import React from 'react';
import { MonthlyBudget, Transaction } from '@/lib/dummy-data';
import { calculateBudgetUsage, BudgetStatus } from '@/lib/budget-utils';
import { BalanceFormatPreference, formatCurrency } from '@/lib/cookie-preference';

interface BudgetMonitorCardProps {
  budget: MonthlyBudget | null | undefined;
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenBudgetModal?: (month: string, currentBudget: MonthlyBudget | null | undefined) => void;
  formatPreference: BalanceFormatPreference;
}

export default function BudgetMonitorCard({
  budget,
  transactions,
  selectedMonth,
  onMonthChange,
  onOpenBudgetModal,
  formatPreference,
}: BudgetMonitorCardProps) {
  const usage = calculateBudgetUsage(budget, transactions, selectedMonth);

  // Status Badge styling sesuai Design System Tim
  const renderStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'safe':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
            Aman
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Hampir Habis
          </span>
        );
      case 'over':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            Melebihi Anggaran
          </span>
        );
      default:
        return null;
    }
  };

  // Warna Progress Bar sesuai status pemakaian
  const getProgressBarColor = (status: BudgetStatus) => {
    switch (status) {
      case 'over':
        return 'bg-[#DC2626]';
      case 'warning':
        return 'bg-[#D97706]';
      case 'safe':
      default:
        return 'bg-[#16A34A]';
    }
  };

  const clampedBarWidth = Math.min(Math.max(usage.usagePercentage, 0), 100);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-xs space-y-4">
      {/* Header Panel Budget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#0F172A]">Budget Bulanan</h2>
            {usage.hasBudget && renderStatusBadge(usage.status)}
          </div>
          <p className="text-xs text-[#64748B]">
            Pantau batas pengeluaran bulanan berdasarkan akumulasi transaksi
          </p>
        </div>

        {/* Kontrol Bulan & Tombol Atur Budget */}
        <div className="flex items-center gap-2">
          <input
            type="month"
            aria-label="Pilih Bulan Anggaran"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-xs font-medium border border-[#E2E8F0] rounded-[6px] px-2.5 py-1.5 bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          />

          {onOpenBudgetModal && (
            <button
              type="button"
              onClick={() => onOpenBudgetModal(selectedMonth, budget)}
              className={`text-xs font-medium px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                usage.hasBudget
                  ? 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                  : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              {usage.hasBudget ? 'Ubah Budget' : 'Atur Budget'}
            </button>
          )}
        </div>
      </div>

      {/* Konten Pemantauan atau Empty State */}
      {!usage.hasBudget ? (
        // Empty State: Anggaran belum diatur pada bulan ini
        <div className="py-6 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-[#64748B]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0F172A]">
            Belum ada anggaran pengeluaran untuk bulan ini
          </p>
          <p className="text-xs text-[#64748B]">
            Tetapkan batas anggaran agar pengeluaran Anda terkontrol otomatis.
          </p>
          {onOpenBudgetModal && (
            <button
              type="button"
              onClick={() => onOpenBudgetModal(selectedMonth, null)}
              className="mt-2 inline-flex items-center text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 rounded-[6px] cursor-pointer"
            >
              Tetapkan Anggaran
            </button>
          )}
        </div>
      ) : (
        // Tampilan Anggaran Terpakai & Sisa
        <div className="space-y-3">
          {/* Tiga Metrik Anggaran */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]">
              <span className="text-xs text-[#64748B] block">Anggaran Bulanan</span>
              <span className="text-base font-semibold text-[#0F172A] mt-0.5 block">
                {formatCurrency(usage.budgetAmount, formatPreference)}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]">
              <span className="text-xs text-[#64748B] block">Terpakai (Pengeluaran)</span>
              <span className="text-base font-semibold text-[#DC2626] mt-0.5 block">
                {formatCurrency(usage.usedAmount, formatPreference)}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]">
              <span className="text-xs text-[#64748B] block">Sisa Anggaran</span>
              <span
                className={`text-base font-semibold mt-0.5 block ${
                  usage.remainingAmount < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                }`}
              >
                {formatCurrency(usage.remainingAmount, formatPreference)}
              </span>
            </div>
          </div>

          {/* Progress Bar Horizontal Pemakaian */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B] font-medium">Persentase Pemakaian</span>
              <span className="font-semibold text-[#0F172A]">
                {Math.round(usage.usagePercentage)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-[#E2E8F0]/70">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                  usage.status
                )}`}
                style={{ width: `${clampedBarWidth}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
