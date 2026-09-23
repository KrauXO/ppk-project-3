'use client';

import React, { useState } from 'react';
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
import { TransactionModal, AddTransactionButton, DeleteConfirmModal } from '@/components/transactions';
import { deleteTransaction } from '@/app/actions/transactions';
import { TransactionModalMode } from '@/types/transaction';

export default function DashboardPage() {
  // Simulasi User Aktif (default: u1 - Alya Putri sesuai kontrak uji tim)
  const [activeUser, setActiveUser] = useState<User>(DUMMY_USERS[0]);

  // Preferensi Format Saldo (SRS-07: tersimpan & sinkron dengan cookie browser)
  const [formatPreference, handlePreferenceChange] = useBalanceFormatPreference();

  // Transaksi state reaktif (mendukung Tambah, Edit, Hapus dari Dev 3)
  const [transactions, setTransactions] = useState<Transaction[]>(DUMMY_TRANSACTIONS);

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

  // Filter transaksi aktif berdasarkan user_id (SRS-05: Data Isolation)
  const userTransactions = getTransactionsByUserId(activeUser.id, transactions);
  // Filter transaksi aktif berdasarkan user_id (SRS-05: Data Isolation)
  const userTransactions = getTransactionsByUserId(activeUser.id, DUMMY_TRANSACTIONS);

  // Hitung ringkasan keuangan berdasarkan data transaksi user aktif (SRS-04)
  const summary = calculateFinancialSummary(userTransactions);

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

  // Eksekusi hapus transaksi (SRS-10)
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteTransaction(transactionToDelete.id, activeUser.id);
      if (!response.success) {
        throw new Error(response.error || 'Gagal menghapus transaksi.');
      }
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
      setToastMessage(response.message || 'Transaksi berhasil dihapus.');
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
  const handleModalSuccess = (savedTx: Transaction, message: string) => {
    if (modalMode === 'create') {
      setTransactions((prev) => [savedTx, ...prev]);
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === savedTx.id ? savedTx : t)));
    }

    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navbar Sederhana (Shared / Dev 1 Slot) */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#2563EB] flex items-center justify-center text-white font-bold text-base">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0F172A] leading-tight">
                DUITku
              </h1>
              <p className="text-[11px] text-[#64748B]">Expense Tracker Mahasiswa</p>
            </div>
          </div>

          {/* Area Info Pengguna & Pengujian User Switcher (SRS-05) */}
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
                  const selected = DUMMY_USERS.find((u) => u.id === e.target.value);
                  if (selected) setActiveUser(selected);
                }}
                className="text-xs bg-white border border-[#E2E8F0] rounded-[4px] px-2 py-1 text-[#0F172A] font-medium focus:outline-none"
                title="Ganti user untuk menguji isolasi data transaksi"
              >
                <option value="u1">u1 - Alya (Data Normal)</option>
                <option value="u2">u2 - Bima (Data Terisolasi)</option>
                <option value="u3">u3 - Citra (Empty State)</option>
              </select>
            </div>
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
        {/* Banner Penjelasan Scope Dev 2 */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-[6px] p-3 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-semibold">Scope Developer 2 Aktif:</span> Menampilkan ringkasan kondisi keuangan (SRS-04), riwayat transaksi (SRS-03), isolasi data (SRS-05), dan cookie preferensi format saldo (SRS-07).
          </div>
          <div className="text-[11px] text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200 self-start sm:self-auto">
            User Aktif: <span className="font-semibold">{activeUser.name} ({activeUser.id})</span>
          </div>
        </div>

        {/* 1. Ringkasan Keuangan (SRS-04) & Cookie Format Preferensi (SRS-07) */}
        <section aria-label="Ringkasan Keuangan">
          <SummaryCards
            summary={summary}
            formatPreference={formatPreference}
            onPreferenceChange={handlePreferenceChange}
          />
        </section>

        {/* Baris Tindakan & Slot Dev 3 (Tambah Transaksi) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h2 className="text-xl font-semibold text-[#0F172A]">Daftar Transaksi</h2>
            <p className="text-xs text-[#64748B]">
              Menampilkan data transaksi keuangan milik {activeUser.name}
            </p>
          </div>

          {/* Slot Integrasi untuk Developer 3 (SRS-08 Tambah Transaksi) */}
          <div id="dev3-add-transaction-slot" className="flex items-center gap-2">
            <AddTransactionButton onClick={handleOpenAddModal} />
          </div>
        </div>

        {/* 2. Tabel Riwayat Transaksi (SRS-03, SRS-05, SRS-09 Edit, SRS-10 Hapus) */}
            {/* Developer 3 akan menaruh tombol trigger 'Tambah Transaksi' di sini */}
            <div className="text-xs text-[#64748B] border border-dashed border-[#E2E8F0] px-3 py-1.5 rounded-[6px] bg-white">
              [Slot Tombol Tambah Transaksi - Dev 3]
            </div>
          </div>
        </div>

        {/* 2. Tabel Riwayat Transaksi (SRS-03, SRS-05) */}
        <section aria-label="Tabel Riwayat Transaksi">
          <TransactionTable
            transactions={userTransactions}
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
          />
        </section>
      </main>
    </div>
  );
}
