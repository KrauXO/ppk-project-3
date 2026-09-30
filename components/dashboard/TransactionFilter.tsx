'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export interface FilterState {
  month: string;      // 'all' atau 'YYYY-MM' (contoh: '2025-02')
  type: string;       // 'all' | 'income' | 'expense'
  category: string;   // 'all' atau nama kategori
}

export interface TransactionFilterProps {
  currentFilter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilter: () => void;
  onAddClick?: () => void;
  isLoading?: boolean;
  availableMonths?: string[];
  availableCategories?: string[];
}

const DEFAULT_MONTHS = ['2025-02', '2025-01'];
const DEFAULT_CATEGORIES = [
  'Uang Saku',
  'Makan',
  'Transport',
  'Beasiswa',
  'Freelance',
  'Lainnya',
];

export default function TransactionFilter({
  currentFilter,
  onFilterChange,
  onResetFilter,
  onAddClick,
  isLoading = false,
  availableMonths = DEFAULT_MONTHS,
  availableCategories = DEFAULT_CATEGORIES,
}: TransactionFilterProps) {
  const isFiltered =
    currentFilter.month !== 'all' ||
    currentFilter.type !== 'all' ||
    currentFilter.category !== 'all';

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...currentFilter,
      month: e.target.value,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...currentFilter,
      type: e.target.value,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...currentFilter,
      category: e.target.value,
    });
  };

  // Format label bulan ramah pengguna (contoh: 2025-02 -> Februari 2025)
  const formatMonthLabel = (m: string) => {
    try {
      const [year, month] = m.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return m;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Baris Tindakan: Judul Seksi & Tombol Tambah Transaksi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A] tracking-tight">
            Daftar Transaksi
          </h2>
        </div>

        {onAddClick && (
          <Button
            type="button"
            variant="primary"
            onClick={onAddClick}
            className="self-start sm:self-auto text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Transaksi</span>
          </Button>
        )}
      </div>

      {/* Bar Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Label Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] mr-1">
            <svg
              className="w-3.5 h-3.5 text-[#64748B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filter:</span>
          </div>

          {/* 1. Dropdown Filter Bulan (YYYY-MM) */}
          <div className="flex-1 min-w-[130px] sm:min-w-[150px]">
            <select
              id="filter-month"
              value={currentFilter.month}
              onChange={handleMonthChange}
              disabled={isLoading}
              className="w-full text-xs bg-white border border-[#E2E8F0] rounded-[6px] px-2.5 py-1.5 text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Filter transaksi berdasarkan periode bulan"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)} ({m})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Dropdown Filter Tipe (Semua | Pemasukan | Pengeluaran) */}
          <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
            <select
              id="filter-type"
              value={currentFilter.type}
              onChange={handleTypeChange}
              disabled={isLoading}
              className="w-full text-xs bg-white border border-[#E2E8F0] rounded-[6px] px-2.5 py-1.5 text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Filter transaksi berdasarkan tipe pemasukan/pengeluaran"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* 3. Dropdown Filter Kategori */}
          <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
            <select
              id="filter-category"
              value={currentFilter.category}
              onChange={handleCategoryChange}
              disabled={isLoading}
              className="w-full text-xs bg-white border border-[#E2E8F0] rounded-[6px] px-2.5 py-1.5 text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              title="Filter transaksi berdasarkan kategori"
            >
              <option value="all">Semua Kategori</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action: Tombol Reset Filter & Indikator Loading */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {isLoading && (
            <span className="text-[11px] text-[#64748B] flex items-center gap-1">
              <svg className="animate-spin h-3.5 w-3.5 text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Memuat...</span>
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onResetFilter}
            disabled={!isFiltered || isLoading}
            className={`text-xs py-1.5 px-3 rounded-[6px] ${!isFiltered ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            title="Kembalikan semua filter ke pengaturan awal"
          >
            Reset Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
