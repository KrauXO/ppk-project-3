'use client';

import React, { useState } from 'react';
import { Transaction, TransactionModalMode } from '@/types/transaction';
import { DUMMY_USERS, INITIAL_TRANSACTIONS } from '@/lib/dummy-data';
import { TransactionModal, AddTransactionButton, DeleteConfirmModal } from '@/components/transactions';
import { deleteTransaction } from '@/app/actions/transactions';

export default function DashboardPage() {
  // Current active user (default u1: Alya Putri sesuai Bagian 11)
  const [currentUser, setCurrentUser] = useState(DUMMY_USERS[0]);

  // Transaksi state (diinisialisasi dari dummy data contract Bagian 11)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

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

  // Filter transaksi berdasarkan user_id aktif (SRS-05: Data Isolation)
  const userTransactions = transactions.filter((t) => t.user_id === currentUser.id);

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
      const response = await deleteTransaction(transactionToDelete.id, currentUser.id);
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

  // Format currency helper sederhana untuk tampilan Rupiah
  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Top Navbar Sederhana (Bagian 5: Layout) */}
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold tracking-tight text-[#0F172A]">DUITku</span>
            <span className="text-xs px-2 py-0.5 rounded-[6px] bg-[#E2E8F0] text-[#64748B] font-medium">
              Expense Tracker
            </span>
          </div>

          {/* Switch User Dummy untuk Uji SRS-05 Data Isolation & Empty State */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <span>Uji Akun:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = DUMMY_USERS.find((u) => u.id === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="px-2.5 py-1 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                {DUMMY_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id === 'u3' ? 'Empty State' : u.id})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[#64748B] border-l border-[#E2E8F0] pl-3">
              {currentUser.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Toast Alert Sukses */}
        {toastMessage && (
          <div
            className="mb-6 p-3 rounded-[6px] bg-green-50 border border-[#16A34A]/20 text-[#16A34A] text-sm flex items-center justify-between"
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
              className="text-[#16A34A] hover:opacity-75 text-xs font-semibold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Action Section (Scope Dev 3: Tombol Tambah Transaksi) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">Daftar Transaksi</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Kelola pencatatan pengeluaran dan pemasukan keuangan mahasiswa ({currentUser.name})
            </p>
          </div>

          {/* Trigger Tambah Transaksi — Komponen Developer 3 */}
          <div>
            <AddTransactionButton onClick={handleOpenAddModal} />
          </div>
        </div>

        {/* Tabel Riwayat Transaksi (Menampilkan data dan tombol trigger aksi Edit & Hapus) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[6px] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-medium text-[#64748B]">
                <tr>
                  <th scope="col" className="px-4 py-3">Tanggal</th>
                  <th scope="col" className="px-4 py-3">Jenis</th>
                  <th scope="col" className="px-4 py-3">Kategori</th>
                  <th scope="col" className="px-4 py-3">Deskripsi</th>
                  <th scope="col" className="px-4 py-3 text-right">Nominal</th>
                  <th scope="col" className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {userTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#64748B]">
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="font-medium text-[#0F172A]">Belum ada transaksi</p>
                        <p className="text-xs">
                          Mulai mencatat transaksi keuangan pertama Anda dengan menekan tombol Tambah Transaksi di atas.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-[#64748B]">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            tx.type === 'income'
                              ? 'bg-green-50 text-[#16A34A] border border-[#16A34A]/20'
                              : 'bg-red-50 text-[#DC2626] border border-[#DC2626]/20'
                          }`}
                        >
                          {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#0F172A] whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="px-4 py-3 text-[#64748B] max-w-sm">
                        <span className="line-clamp-2" title={tx.description}>
                          {tx.description || '-'}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          tx.type === 'income' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Trigger Edit Transaksi (SRS-09) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(tx)}
                            className="px-2.5 py-1 text-xs font-medium rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {/* Trigger Hapus Transaksi (SRS-10) */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(tx)}
                            className="px-2.5 py-1 text-xs font-medium rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#DC2626] hover:bg-red-50 hover:border-[#DC2626] transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form Transaksi Terpadu (SRS-08 & SRS-09) */}
      <TransactionModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedTransaction}
        userId={currentUser.id}
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
    </div>
  );
}
