'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DUMMY_USERS,
  DUMMY_TRANSACTIONS,
  DUMMY_BUDGETS,
  getTransactionsByUserId,
  calculateFinancialSummary,
  User,
  Transaction,
  MonthlyBudget,
} from '@/lib/dummy-data';
import {
  useBalanceFormatPreference,
} from '@/lib/cookie-preference';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import TransactionFilter, { FilterState } from '@/components/dashboard/TransactionFilter';
import { TransactionModal, DeleteConfirmModal } from '@/components/transactions';
import { BudgetMonitorCard, BudgetModal } from '@/components/budget';
import { deleteTransaction } from '@/app/actions/transactions';
import { TransactionModalMode } from '@/types/transaction';

export default function DashboardPage() {
  const router = useRouter();

  // Daftar user (mendukung user baru dari session login selain DUMMY_USERS)
  const [userOptions, setUserOptions] = useState<User[]>(DUMMY_USERS);
  // User Aktif (default: u1 - Alya Putri, disinkronkan dengan session login aktif)
  const [activeUser, setActiveUser] = useState<User>(DUMMY_USERS[0]);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Preferensi Format Saldo (SRS-07: tersimpan & sinkron dengan cookie browser)
  const [formatPreference, handlePreferenceChange] = useBalanceFormatPreference();

  // Filter transaksi aktif via AJAX (SRS-11)
  const [filter, setFilter] = useState<FilterState>({
    month: 'all',
    type: 'all',
    category: 'all',
  });
  const [allUserTransactions, setAllUserTransactions] = useState<Transaction[]>(() =>
    getTransactionsByUserId(DUMMY_USERS[0].id, DUMMY_TRANSACTIONS)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getTransactionsByUserId(DUMMY_USERS[0].id, DUMMY_TRANSACTIONS)
  );
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  // State Budget Bulanan (SRS-12, SRS-13, SRS-14)
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(DUMMY_BUDGETS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-02');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);

  // Sinkronisasi session login (Dev 1)
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const match = DUMMY_USERS.find(
            (u) =>
              u.id === data.user.id ||
              u.email.toLowerCase() === data.user.email.toLowerCase()
          );
          const loggedIn: User = match || {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            created_at: '',
          };
          setActiveUser(loggedIn);
          setUserOptions((prev) =>
            prev.some((u) => u.id === loggedIn.id) ? prev : [loggedIn, ...prev]
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fungsi pemuat transaksi via AJAX Route Handler /api/transactions (SRS-11)
  const fetchTransactionsAjax = useCallback(
    async (userId: string, currentFilter: FilterState) => {
      setIsFilterLoading(true);
      try {
        const filteredParams = new URLSearchParams({
          userId,
          month: currentFilter.month,
          type: currentFilter.type,
          category: currentFilter.category,
        });
        const allParams = new URLSearchParams({
          userId,
          month: 'all',
          type: 'all',
          category: 'all',
        });

        const [filteredRes, allRes] = await Promise.all([
          fetch(`/api/transactions?${filteredParams.toString()}`),
          fetch(`/api/transactions?${allParams.toString()}`),
        ]);

        if (filteredRes.ok) {
          const filteredData = await filteredRes.json();
          if (Array.isArray(filteredData.transactions)) {
            setTransactions(filteredData.transactions);
          }
        }
        if (allRes.ok) {
          const allData = await allRes.json();
          if (Array.isArray(allData.transactions)) {
            setAllUserTransactions(allData.transactions);
          }
        }
      } catch (err) {
        console.error('AJAX transactions fetch error:', err);
      } finally {
        setIsFilterLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactionsAjax(activeUser.id, filter);
  }, [activeUser.id, filter, fetchTransactionsAjax]);

  // Sinkronisasi data budget user aktif via AJAX GET /api/budgets (SRS-11, SRS-14)
  useEffect(() => {
    fetch(`/api/budgets?userId=${encodeURIComponent(activeUser.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success && Array.isArray(result.data)) {
          setBudgets((prev) => {
            const others = prev.filter((b) => b.user_id !== activeUser.id);
            return [...others, ...result.data];
          });
        }
      })
      .catch(() => {});
  }, [activeUser.id]);

  const handleFilterChange = (newFilter: FilterState) => {
    setFilter(newFilter);
  };

  const handleResetFilter = () => {
    setFilter({ month: 'all', type: 'all', category: 'all' });
  };

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

  // Modal state untuk Developer 3 (SRS-08 & SRS-09)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<TransactionModalMode>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Modal state konfirmasi hapus (SRS-10)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast / feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hitung ringkasan keuangan berdasarkan seluruh data transaksi user aktif (SRS-04)
  const summary = calculateFinancialSummary(allUserTransactions);

  // Cari budget aktif untuk user & bulan terpilih (SRS-13, SRS-14)
  const activeBudget =
    budgets.find((b) => b.user_id === activeUser.id && b.month === selectedMonth) || null;

  // Trigger modal tambah transaksi (SRS-08)
  const handleOpenAddModal = () => {
    setModalMode('create');
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  // Trigger modal edit transaksi (SRS-09)
  const handleOpenEditModal = (tx: Transaction) => {
    setModalMode('edit');
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  // Trigger modal konfirmasi hapus transaksi (SRS-10)
  const handleOpenDeleteModal = (tx: Transaction) => {
    setTransactionToDelete(tx);
    setIsDeleteModalOpen(true);
  };

  // Eksekusi hapus transaksi via AJAX DELETE /api/transactions/[id] (SRS-10, SRS-11)
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      let deleted = false;
      let msg = 'Transaksi berhasil dihapus.';

      try {
        const res = await fetch(
          `/api/transactions/${encodeURIComponent(transactionToDelete.id)}?userId=${encodeURIComponent(activeUser.id)}`,
          { method: 'DELETE' }
        );
        if (res.ok) {
          const data = await res.json();
          deleted = true;
          if (data.message) msg = data.message;
        }
      } catch {
        // Fallback ke server action
      }

      if (!deleted) {
        const response = await deleteTransaction(transactionToDelete.id, activeUser.id);
        if (!response.success) {
          throw new Error(response.error || 'Gagal menghapus transaksi.');
        }
        if (response.message) msg = response.message;
      }

      await fetchTransactionsAjax(activeUser.id, filter);
      setToastMessage(msg);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus transaksi.';
      setToastMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Callback sukses dari TransactionModal (Tambah / Edit)
  const handleModalSuccess = async (_savedTx: Transaction, message: string) => {
    await fetchTransactionsAjax(activeUser.id, filter);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Callback sukses dari BudgetModal (SRS-12)
  const handleBudgetSuccess = (savedBudget: MonthlyBudget, message: string) => {
    setBudgets((prev) => {
      const idx = prev.findIndex(
        (b) => b.user_id === savedBudget.user_id && b.month === savedBudget.month
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedBudget;
        return next;
      }
      return [...prev, savedBudget];
    });
    setSelectedMonth(savedBudget.month);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navbar Terintegrasi */}
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
                <p className="text-[10px] text-[#64748B]">Expense Tracker Mahasiswa</p>
              </div>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#64748B]">
              <Link href="/dashboard" className="text-[#2563EB] font-semibold">
                Dashboard Transaksi
              </Link>
            </nav>
          </div>

          {/* Area Info Pengguna, Pengujian User Switcher (SRS-05), & Logout (SRS-06) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#0F172A]">{activeUser.name}</p>
              <p className="text-[11px] text-[#64748B]">{activeUser.email}</p>
            </div>

            {/* Selector User untuk Pengujian Isolasi Data (SRS-05 & Empty State SRS-03) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-[6px] border border-[#E2E8F0]">
              <span className="text-[11px] font-medium text-[#64748B] px-1 hidden md:inline">
                User Uji:
              </span>
              <select
                value={activeUser.id}
                onChange={(e) => {
                  const selected = userOptions.find((u) => u.id === e.target.value);
                  if (selected) setActiveUser(selected);
                }}
                className="text-xs bg-white border border-[#E2E8F0] rounded-[4px] px-2 py-1 text-[#0F172A] font-medium focus:outline-none"
                title="Ganti user untuk menguji isolasi data transaksi"
              >
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs font-medium rounded-[6px] border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? 'Keluar...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alert Sukses */}
        {toastMessage && (
          <div
            className="p-3 rounded-[6px] bg-green-50 border border-[#16A34A]/20 text-[#16A34A] text-sm flex items-center justify-between"
            role="status"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#16A34A] hover:opacity-75 text-xs font-semibold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Ringkasan Keuangan (SRS-04) & Cookie Format Preferensi (SRS-07) */}
        <section aria-label="Ringkasan Keuangan">
          <SummaryCards
            summary={summary}
            formatPreference={formatPreference}
            onPreferenceChange={handlePreferenceChange}
          />
        </section>

        {/* 2. Panel Pemantauan Budget Bulanan (SRS-12, SRS-13, SRS-14) */}
        <section aria-label="Pemantauan Budget Bulanan">
          <BudgetMonitorCard
            budget={activeBudget}
            transactions={allUserTransactions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onOpenBudgetModal={(month) => {
              setSelectedMonth(month);
              setIsBudgetModalOpen(true);
            }}
            formatPreference={formatPreference}
          />
        </section>

        {/* 3. Header, Tombol Tambah Transaksi (SRS-08), & Filter Transaksi via AJAX (SRS-11) */}
        <section aria-label="Filter Transaksi">
          <TransactionFilter
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            onAddClick={handleOpenAddModal}
            isLoading={isFilterLoading}
          />
        </section>

        {/* 4. Tabel Riwayat Transaksi (SRS-03, SRS-05, SRS-09 Edit, SRS-10 Hapus) */}
        <section aria-label="Tabel Riwayat Transaksi">
          <TransactionTable
            transactions={transactions}
            formatPreference={formatPreference}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        </section>
      </main>

      {/* Modal Form Transaksi Terpadu (SRS-08 & SRS-09) */}
      <TransactionModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedTransaction}
        userId={activeUser.id}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal Atur / Ubah Budget Bulanan (SRS-12) */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        userId={activeUser.id}
        currentMonth={selectedMonth}
        initialAmount={activeBudget?.amount ?? null}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={handleBudgetSuccess}
      />

      {/* Modal Konfirmasi Hapus Transaksi (SRS-10) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        transaction={transactionToDelete}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
