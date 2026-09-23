'use client';

import React from 'react';
import { FinancialSummary } from '@/lib/dummy-data';
import { BalanceFormatPreference, formatCurrency } from '@/lib/cookie-preference';

interface SummaryCardsProps {
  summary: FinancialSummary;
  formatPreference: BalanceFormatPreference;
  onPreferenceChange: (pref: BalanceFormatPreference) => void;
}

export default function SummaryCards({
  summary,
  formatPreference,
  onPreferenceChange,
}: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      {/* Baris Kontrol Preferensi Format Saldo (SRS-07) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white border border-[#E2E8F0] rounded-[6px] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Preferensi Tampilan (SRS-07)
          </span>
          <span className="text-xs text-[#64748B]">
            — Disimpan di Cookie Browser
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="balance-format-select" className="text-xs font-medium text-[#0F172A]">
            Format Nominal:
          </label>
          <select
            id="balance-format-select"
            value={formatPreference}
            onChange={(e) => onPreferenceChange(e.target.value as BalanceFormatPreference)}
            className="text-xs border border-[#E2E8F0] rounded-[6px] px-2 py-1 bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="with_symbol">Simbol Lengkap (Rp 14.310.000)</option>
            <option value="without_symbol">Angka Saja (14.310.000)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards Grid (SRS-04) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kartu 1: Saldo */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#64748B]">Saldo Saat Ini</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-[#0F172A]">
              Bersih
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-[#0F172A] tracking-tight">
              {formatCurrency(summary.balance, formatPreference)}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Total Pemasukan dikurangi Pengeluaran
          </p>
        </div>

        {/* Kartu 2: Total Pemasukan */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#64748B]">Total Pemasukan</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-[#16A34A] border border-green-200">
              Income
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-[#16A34A] tracking-tight">
              {formatCurrency(summary.totalIncome, formatPreference)}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Akumulasi seluruh pemasukan
          </p>
        </div>

        {/* Kartu 3: Total Pengeluaran */}
        <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#64748B]">Total Pengeluaran</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200">
              Expense
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-[#DC2626] tracking-tight">
              {formatCurrency(summary.totalExpense, formatPreference)}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Akumulasi seluruh pengeluaran
          </p>
        </div>
      </div>
    </div>
  );
}
