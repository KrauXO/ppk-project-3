'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Transaction, TransactionFormData, TransactionModalMode, TransactionType } from '@/types/transaction';
import { createTransaction, updateTransaction } from '@/app/actions/transactions';

interface TransactionModalProps {
  isOpen: boolean;
  mode: TransactionModalMode;
  initialData?: Transaction | null;
  userId: string;
  onClose: () => void;
  onSuccess: (transaction: Transaction, message: string) => void;
}

const INCOME_CATEGORIES = ['Uang Saku', 'Beasiswa', 'Freelance', 'Gaji', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transport', 'Lainnya', 'Tagihan', 'Pendidikan', 'Belanja'];

interface InnerFormProps {
  mode: TransactionModalMode;
  initialData?: Transaction | null;
  userId: string;
  onClose: () => void;
  onSuccess: (transaction: Transaction, message: string) => void;
}

function TransactionFormInner({ mode, initialData, userId, onClose, onSuccess }: InnerFormProps) {
  const initialType: TransactionType = initialData ? initialData.type : 'expense';
  const initialCategories = initialType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isCustomInit =
    Boolean(initialData?.category) && !initialCategories.includes(initialData?.category || '');

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>(initialData ? initialData.amount.toString() : '');
  const [category, setCategory] = useState<string>(() => {
    if (initialData?.category) {
      return isCustomInit ? 'Lainnya' : initialData.category;
    }
    return initialCategories[0];
  });
  const [customCategory, setCustomCategory] = useState<string>(isCustomInit ? initialData?.category || '' : '');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(isCustomInit);
  const [date, setDate] = useState<string>(
    initialData?.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState<string>(initialData?.description || '');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus input nominal untuk kecepatan input transaksi
    amountInputRef.current?.focus();
  }, []);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const categories = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!categories.includes(category) && !isCustomCategory) {
      setCategory(categories[0]);
    }
  };

  const numericAmount = parseFloat(amount);
  const formattedPreview =
    !isNaN(numericAmount) && numericAmount > 0
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
          numericAmount
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMessage('Nominal harus diisi dengan angka lebih besar dari 0.');
      amountInputRef.current?.focus();
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      setErrorMessage('Kategori transaksi wajib dipilih atau diisi.');
      return;
    }

    if (!date) {
      setErrorMessage('Tanggal transaksi wajib dipilih.');
      return;
    }

    const payload: TransactionFormData = {
      type,
      amount: finalAmount,
      category: finalCategory,
      date,
      description: description.trim(),
    };

    setIsLoading(true);

    try {
      if (mode === 'create') {
        const response = await createTransaction(payload, userId);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Gagal menambahkan transaksi.');
        }
        onSuccess(response.data, response.message || 'Transaksi berhasil ditambahkan.');
      } else {
        if (!initialData?.id) {
          throw new Error('ID transaksi tidak valid untuk mode edit.');
        }
        const response = await updateTransaction(initialData.id, payload, userId);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Gagal memperbarui transaksi.');
        }
        onSuccess(response.data, response.message || 'Transaksi berhasil diperbarui.');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan transaksi.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="w-full max-w-lg rounded-[6px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-md overflow-hidden text-[#0F172A]">
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <div>
          <h2 id="modal-transaction-title" className="text-xl font-semibold text-[#0F172A]">
            {mode === 'create' ? 'Tambah Transaksi' : 'Edit Transaksi'}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {mode === 'create'
              ? 'Catat pemasukan atau pengeluaran keuangan baru'
              : 'Perbarui rincian transaksi yang sudah dicatat'}
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

      {/* Modal Body Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Error Message Box */}
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

        {/* 1. Jenis Transaksi (Segmented Toggle) */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Jenis Transaksi <span className="text-[#DC2626]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              disabled={isLoading}
              className={`py-2 px-3 text-sm font-medium rounded-[6px] border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              disabled={isLoading}
              className={`py-2 px-3 text-sm font-medium rounded-[6px] border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'income'
                  ? 'bg-[#16A34A] text-white border-[#16A34A]'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
              Pemasukan
            </button>
          </div>
        </div>

        {/* 2. Nominal (Amount) */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label htmlFor="tx-amount" className="text-sm font-medium text-[#0F172A]">
              Nominal (Rp) <span className="text-[#DC2626]">*</span>
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
              id="tx-amount"
              ref={amountInputRef}
              type="number"
              min="1"
              step="any"
              placeholder="misal: 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              required
              className="w-full pl-10 pr-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>

        {/* 3. Kategori */}
        <div>
          <label htmlFor="tx-category" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Kategori <span className="text-[#DC2626]">*</span>
          </label>
          <div className="space-y-2">
            <select
              id="tx-category"
              value={isCustomCategory ? '__custom__' : category}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomCategory(true);
                } else {
                  setIsCustomCategory(false);
                  setCategory(e.target.value);
                }
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">+ Kategori Kustom Lainnya...</option>
            </select>

            {isCustomCategory && (
              <input
                type="text"
                placeholder="Ketik nama kategori kustom..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                disabled={isLoading}
                maxLength={50}
                className="w-full px-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            )}
          </div>
        </div>

        {/* 4. Tanggal */}
        <div>
          <label htmlFor="tx-date" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Tanggal Transaksi <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            required
            className="w-full px-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* 5. Deskripsi / Keterangan (Mendukung teks panjang seperti t4) */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label htmlFor="tx-description" className="text-sm font-medium text-[#0F172A]">
              Deskripsi / Keterangan
            </label>
            <span className="text-xs text-[#64748B]">Opsional ({description.length}/255)</span>
          </div>
          <textarea
            id="tx-description"
            rows={3}
            placeholder="Contoh: Makan siang di kantin, Ojek online ke kampus, Beli buku referensi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            maxLength={255}
            className="w-full px-3 py-2 text-sm rounded-[6px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors resize-none"
          />
        </div>

        {/* Modal Footer Actions */}
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
            <span>
              {isLoading
                ? 'Menyimpan...'
                : mode === 'create'
                ? 'Simpan Transaksi'
                : 'Perbarui Transaksi'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TransactionModal({
  isOpen,
  mode,
  initialData,
  userId,
  onClose,
  onSuccess,
}: TransactionModalProps) {
  // Shortcut Escape key listener
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
      aria-labelledby="modal-transaction-title"
    >
      <TransactionFormInner
        key={`${mode}-${initialData?.id || 'new'}`}
        mode={mode}
        initialData={initialData}
        userId={userId}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
