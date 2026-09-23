'use client';

import React from 'react';
import { Transaction } from '@/lib/dummy-data';
import { BalanceFormatPreference, formatCurrency } from '@/lib/cookie-preference';

interface TransactionTableProps {
  transactions: Transaction[];
  formatPreference: BalanceFormatPreference;
}

export default function TransactionTable({
  transactions,
  formatPreference,
}: TransactionTableProps) {
  // Format tanggal ramah pengguna (contoh: 01 Feb 2025)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[6px] overflow-hidden shadow-xs">
      {/* Header Bagian Tabel */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">Riwayat Transaksi</h2>
          <p className="text-xs text-[#64748B]">
            Daftar seluruh transaksi yang terhubung dengan akun Anda
          </p>
        </div>
        <div className="text-xs text-[#64748B] font-medium">
          Total: {transactions.length} Transaksi
        </div>
      </div>

      {/* Konten Tabel atau Empty State */}
      {transactions.length === 0 ? (
        // Empty State (SRS-03 & feedback states untuk user u3)
        <div className="py-12 px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-[#64748B] mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A]">Belum ada transaksi</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Transaksi yang Anda catat akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        // Tabel Data Transaksi Normal (SRS-03, SRS-05)
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">Tanggal</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3 min-w-[200px]">Deskripsi</th>
                <th scope="col" className="px-4 py-3">Tipe</th>
                <th scope="col" className="px-4 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {transactions.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <tr key={t.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#0F172A] whitespace-nowrap">
                      {t.category}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#0F172A] max-w-md break-words">
                      {t.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isIncome ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-[#16A34A] border border-green-200">
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-[#DC2626] border border-red-200">
                          Pengeluaran
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-xs font-semibold text-right whitespace-nowrap ${
                        isIncome ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount, formatPreference)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
