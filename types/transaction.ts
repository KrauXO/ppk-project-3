/**
 * Kontrak Tipe Data Transaksi & Form Modal
 * Sesuai Dokumen SRS DUITku (Bagian 11: Dummy Data Contract)
 */

export type TransactionType = 'income' | 'expense';

export type { User, Transaction, FinancialSummary } from '@/lib/dummy-data';

export interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  category: string;
  date: string;
  description: string;
}

export type TransactionModalMode = 'create' | 'edit';
