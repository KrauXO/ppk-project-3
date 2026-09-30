'use server';

import { Transaction, TransactionFormData } from '@/types/transaction';
import { DUMMY_TRANSACTIONS } from '@/lib/dummy-data';
import { sql } from '@/lib/db';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

let memoryTransactions: Transaction[] = [...DUMMY_TRANSACTIONS];
let txDbInitialized = false;

async function ensureTransactionsDbInitialized(): Promise<boolean> {
  if (txDbInitialized) return true;
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || dbUrl.includes('user:password@host/dbname')) return false;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount NUMERIC NOT NULL,
        description TEXT DEFAULT '',
        date VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const existing = await sql`SELECT COUNT(*)::int as count FROM transactions;`;
    if (existing[0]?.count === 0) {
      for (const t of DUMMY_TRANSACTIONS) {
        await sql`
          INSERT INTO transactions (id, user_id, type, category, amount, description, date, created_at)
          VALUES (${t.id}, ${t.user_id}, ${t.type}, ${t.category}, ${t.amount}, ${t.description}, ${t.date}, ${t.created_at})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    txDbInitialized = true;
    return true;
  } catch (err) {
    console.warn('Peringatan: Database transaksi belum terjangkau, menggunakan fallback in-memory:', err);
    return false;
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  if (await ensureTransactionsDbInitialized()) {
    try {
      const rows = await sql`
        SELECT id, user_id, type, category, amount, description, date, created_at
        FROM transactions
        ORDER BY date DESC, created_at DESC;
      `;
      return rows.map((row) => ({
        id: String(row.id),
        user_id: String(row.user_id),
        type: row.type as 'income' | 'expense',
        category: String(row.category),
        amount: Number(row.amount),
        description: String(row.description || ''),
        date: String(row.date).slice(0, 10),
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      // Fallback ke memoryTransactions
    }
  }
  return memoryTransactions;
}

/**
 * Validasi form transaksi (SRS-08 & SRS-09)
 * - Nominal: wajib diisi, numerik, dan > 0
 * - Kategori: wajib dipilih/diisi
 * - Tanggal: wajib diisi dengan format YYYY-MM-DD yang valid
 * - Tipe: 'income' atau 'expense'
 */
function validateTransactionInput(data: TransactionFormData): string | null {
  if (!data.type || (data.type !== 'income' && data.type !== 'expense')) {
    return 'Jenis transaksi harus berupa Pemasukan atau Pengeluaran.';
  }

  const numAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Nominal transaksi harus lebih besar dari 0.';
  }

  if (!data.category || data.category.trim() === '') {
    return 'Kategori transaksi wajib dipilih atau diisi.';
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    return 'Tanggal transaksi tidak valid.';
  }

  return null;
}

/**
 * SRS-08: Menambahkan transaksi baru
 * Terikat ke user_id yang aktif (SRS-05: Data Isolation)
 */
export async function createTransaction(
  formData: TransactionFormData,
  userId: string
): Promise<ActionResponse<Transaction>> {
  try {
    if (!userId) {
      return { success: false, error: 'Pengguna tidak terautentikasi (User ID tidak ditemukan).' };
    }

    const validationError = validateTransactionInput(formData);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const numAmount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount;
    const newId = 't_' + Date.now();
    const cleanCategory = formData.category.trim();
    const cleanDesc = (formData.description || '').trim();
    const dateStr = formData.date;

    // Coba simpan ke Neon PostgreSQL jika database sudah siap
    if (await ensureTransactionsDbInitialized()) {
      try {
        const result = await sql`
          INSERT INTO transactions (id, user_id, type, category, amount, description, date, created_at)
          VALUES (${newId}, ${userId}, ${formData.type}, ${cleanCategory}, ${numAmount}, ${cleanDesc}, ${dateStr}, NOW())
          RETURNING id, user_id, type, category, amount, description, date, created_at;
        `;

        if (result && result.length > 0) {
          const row = result[0];
          const saved: Transaction = {
            id: String(row.id),
            user_id: String(row.user_id),
            type: row.type as 'income' | 'expense',
            category: String(row.category),
            amount: Number(row.amount),
            description: String(row.description || ''),
            date: String(row.date).slice(0, 10),
            created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          };
          memoryTransactions = [saved, ...memoryTransactions];
          return {
            success: true,
            message: 'Transaksi berhasil ditambahkan.',
            data: saved,
          };
        }
      } catch (dbError) {
        console.warn('Peringatan: Tidak dapat terhubung ke database Neon (menggunakan fallback in-memory):', dbError);
      }
    }

    // Fallback: Mengembalikan objek transaksi yang valid untuk lingkungan pengujian/offline
    const fallbackTransaction: Transaction = {
      id: newId,
      user_id: userId,
      type: formData.type,
      category: cleanCategory,
      amount: numAmount,
      description: cleanDesc,
      date: dateStr,
      created_at: new Date().toISOString(),
    };
    memoryTransactions = [fallbackTransaction, ...memoryTransactions];

    return {
      success: true,
      message: 'Transaksi berhasil ditambahkan.',
      data: fallbackTransaction,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan internal server.';
    return { success: false, error: errorMsg };
  }
}

/**
 * SRS-09: Mengubah transaksi yang sudah ada
 * Menggunakan query filter WHERE id = $1 AND user_id = $2 (SRS-05: Data Isolation)
 */
export async function updateTransaction(
  id: string,
  formData: TransactionFormData,
  userId: string
): Promise<ActionResponse<Transaction>> {
  try {
    if (!id) {
      return { success: false, error: 'ID transaksi tidak ditemukan.' };
    }

    if (!userId) {
      return { success: false, error: 'Pengguna tidak terautentikasi (User ID tidak ditemukan).' };
    }

    const validationError = validateTransactionInput(formData);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const numAmount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount;
    const cleanCategory = formData.category.trim();
    const cleanDesc = (formData.description || '').trim();
    const dateStr = formData.date;

    // Coba update ke Neon PostgreSQL
    if (await ensureTransactionsDbInitialized()) {
      try {
        const result = await sql`
          UPDATE transactions
          SET type = ${formData.type},
              category = ${cleanCategory},
              amount = ${numAmount},
              description = ${cleanDesc},
              date = ${dateStr}
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id, user_id, type, category, amount, description, date, created_at;
        `;

        if (result && result.length > 0) {
          const row = result[0];
          const updated: Transaction = {
            id: String(row.id),
            user_id: String(row.user_id),
            type: row.type as 'income' | 'expense',
            category: String(row.category),
            amount: Number(row.amount),
            description: String(row.description || ''),
            date: String(row.date).slice(0, 10),
            created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          };
          memoryTransactions = memoryTransactions.map((t) => (t.id === id ? updated : t));
          return {
            success: true,
            message: 'Transaksi berhasil diperbarui.',
            data: updated,
          };
        }
      } catch (dbError) {
        console.warn('Peringatan: Tidak dapat terhubung ke database Neon (menggunakan fallback in-memory):', dbError);
      }
    }

    // Fallback: Mengembalikan objek transaksi yang sudah diperbarui
    const updatedTransaction: Transaction = {
      id,
      user_id: userId,
      type: formData.type,
      category: cleanCategory,
      amount: numAmount,
      description: cleanDesc,
      date: dateStr,
      created_at: new Date().toISOString(),
    };
    memoryTransactions = memoryTransactions.map((t) => (t.id === id && t.user_id === userId ? updatedTransaction : t));

    return {
      success: true,
      message: 'Transaksi berhasil diperbarui.',
      data: updatedTransaction,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui transaksi.';
    return { success: false, error: errorMsg };
  }
}

/**
 * SRS-10: Menghapus transaksi
 * Menggunakan query filter WHERE id = $1 AND user_id = $2 (SRS-05: Data Isolation)
 */
export async function deleteTransaction(
  id: string,
  userId: string
): Promise<ActionResponse<boolean>> {
  try {
    if (!id) {
      return { success: false, error: 'ID transaksi tidak ditemukan.' };
    }

    if (!userId) {
      return { success: false, error: 'Pengguna tidak terautentikasi (User ID tidak ditemukan).' };
    }

    // Coba hapus dari Neon PostgreSQL
    if (await ensureTransactionsDbInitialized()) {
      try {
        await sql`
          DELETE FROM transactions
          WHERE id = ${id} AND user_id = ${userId};
        `;
      } catch (dbError) {
        console.warn('Peringatan: Tidak dapat terhubung ke database Neon (menggunakan fallback in-memory):', dbError);
      }
    }

    memoryTransactions = memoryTransactions.filter((t) => !(t.id === id && t.user_id === userId));

    return {
      success: true,
      message: 'Transaksi berhasil dihapus.',
      data: true,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus transaksi.';
    return { success: false, error: errorMsg };
  }
}

