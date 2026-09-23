/**
 * Kontrak Tipe Data Transaksi & Form Modal
 * Sesuai Dokumen SRS DUITku (Bagian 11: Dummy Data Contract)
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string; // Relasi ke User.id (SRS-05 Data Isolation)
  type: TransactionType; // "income" | "expense"
  category: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  category: string;
  date: string;
  description: string;
}

export type TransactionModalMode = 'create' | 'edit';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  created_at?: string;
}
