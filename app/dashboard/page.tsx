'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DUMMY_USERS,
  DUMMY_TRANSACTIONS,
  getTransactionsByUserId,
  calculateFinancialSummary,
  User,
  Transaction,
} from '@/lib/dummy-data';
import {
  useBalanceFormatPreference,
} from '@/lib/cookie-preference';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import TransactionFilter, { FilterState } from '@/components/dashboard/TransactionFilter';

export default function DashboardPage() {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<User>(DUMMY_USERS[0]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sinkronisasi otomatis dengan user sesi yang sedang login
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const match = DUMMY_USERS.find(
            (u) =>
              u.id === data.user.id ||
              u.email.toLowerCase() === data.user.email.toLowerCase()
          );
          if (match) {
            setActiveUser(match);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  // Preferensi Format Saldo
  const [formatPreference, handlePreferenceChange] = useBalanceFormatPreference();

  // Filter transaksi aktif via AJAX
  const [filter, setFilter] = useState<FilterState>({
    month: 'all',
    type: 'all',
    category: 'all',
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getTransactionsByUserId(activeUser.id, DUMMY_TRANSACTIONS)
  );
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleFilterChange = (newFilter: FilterState) => {
    setIsFilterLoading(true);
    setFilter(newFilter);
  };

  const handleResetFilter = () => {
    setIsFilterLoading(true);
    setFilter({ month: 'all', type: 'all', category: 'all' });
  };

  // Ambil transaksi via AJAX Route Handler /api/transactions saat user atau filter berubah
  useEffect(() => {
    let isMounted = true;

    const queryParams = new URLSearchParams({
      userId: activeUser.id,
      month: filter.month,
      type: filter.type,
      category: filter.category,
    });

    fetch(`/api/transactions?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat transaksi via AJAX');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      })
      .catch((err) => {
        console.error('AJAX transactions fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setIsFilterLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUser.id, filter]);

  // Hitung ringkasan keuangan berdasarkan seluruh data transaksi user aktif
  const allUserTransactions = getTransactionsByUserId(activeUser.id, DUMMY_TRANSACTIONS);
  const summary = calculateFinancialSummary(allUserTransactions);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navbar Sederhana (Shared / Dev 1 Slot) */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#2563EB] flex items-center justify-center text-white font-bold text-base">
                D
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#0F172A] leading-tight">
                  DUIT<span className="text-[#2563EB]">ku</span>
                </h1>
                <p className="text-[10px] text-[#64748B]">Expense Tracker</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-medium text-[#64748B]">
              <Link href="/dashboard" className="text-[#2563EB] font-semibold">
                Dashboard Transaksi
              </Link>
            </nav>
          </div>

          {/* Area Info Pengguna & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#0F172A]">{activeUser.name}</p>
              <p className="text-[11px] text-[#64748B]">{activeUser.email}</p>
            </div>


            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-medium px-2.5 py-1.5 rounded-[4px] transition-colors"
            >
              {isLoggingOut ? 'Keluar...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. Ringkasan Keuangan */}
        <section aria-label="Ringkasan Keuangan">
          <SummaryCards
            summary={summary}
            formatPreference={formatPreference}
            onPreferenceChange={handlePreferenceChange}
          />
        </section>

        {/* Header & Filter Daftar Transaksi */}
        <section aria-label="Filter Transaksi">
          <TransactionFilter
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            isLoading={isFilterLoading}
          />
        </section>

        {/* 2. Tabel Riwayat Transaksi */}
        <section aria-label="Tabel Riwayat Transaksi">
          <TransactionTable
            transactions={transactions}
            formatPreference={formatPreference}
          />
        </section>
      </main>
    </div>
  );
}
