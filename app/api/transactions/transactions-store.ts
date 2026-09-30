import { sql } from '@/lib/db';
import { Transaction, DUMMY_TRANSACTIONS } from '@/lib/dummy-data';

// Fallback in-memory transaction store initialized with PRD Section 11 dummy contract
let memoryTransactions: Transaction[] = [...DUMMY_TRANSACTIONS];
let dbInitialized = false;

/**
 * Initialize table in Neon PostgreSQL if connected and seed dummy transactions if empty
 */
async function ensureDbInitialized(): Promise<boolean> {
  if (dbInitialized) return true;

  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || dbUrl.includes('user:password@host/dbname')) {
      return false;
    }

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

    // Check if seeded
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

    dbInitialized = true;
    return true;
  } catch (error) {
    console.warn('Neon DB not reachable for transactions, using in-memory fallback:', error);
    return false;
  }
}

export interface TransactionFilterParams {
  userId: string;
  month?: string;
  type?: string;
  category?: string;
}

/**
 * Get filtered transactions for a user (SRS-05 Data Isolation, SRS-03, SRS-11)
 */
export async function getFilteredTransactions(params: TransactionFilterParams): Promise<Transaction[]> {
  const { userId, month, type, category } = params;

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      // Fetch from PostgreSQL Neon
      const rows = await sql`
        SELECT id, user_id, type, category, amount::float as amount, description, date, created_at
        FROM transactions
        WHERE user_id = ${userId}
        ORDER BY date DESC, created_at DESC;
      `;

      let list = rows as Transaction[];

      if (month && month !== 'all') {
        list = list.filter((t) => t.date.startsWith(month));
      }
      if (type && type !== 'all') {
        list = list.filter((t) => t.type === type);
      }
      if (category && category !== 'all') {
        list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
      }

      return list;
    } catch {
      // Fallback to in-memory on DB error
    }
  }

  // In-memory filtering (strict user_id isolation)
  return memoryTransactions.filter((t) => {
    if (t.user_id !== userId) return false;
    if (month && month !== 'all' && !t.date.startsWith(month)) return false;
    if (type && type !== 'all' && t.type !== type) return false;
    if (category && category !== 'all' && t.category.toLowerCase() !== category.toLowerCase()) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      const rows = await sql`
        SELECT id, user_id, type, category, amount::float as amount, description, date, created_at
        FROM transactions
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as Transaction;
      return null;
    } catch {
      // Fallback
    }
  }

  const found = memoryTransactions.find((t) => t.id === id);
  return found ? { ...found } : null;
}

/**
 * Create a new transaction (SRS-08 via AJAX POST)
 */
export async function createTransaction(data: {
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
}): Promise<Transaction> {
  const newTx: Transaction = {
    id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: data.user_id,
    type: data.type,
    category: data.category.trim(),
    amount: Number(data.amount),
    description: (data.description || '').trim(),
    date: data.date,
    created_at: new Date().toISOString(),
  };

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      await sql`
        INSERT INTO transactions (id, user_id, type, category, amount, description, date, created_at)
        VALUES (${newTx.id}, ${newTx.user_id}, ${newTx.type}, ${newTx.category}, ${newTx.amount}, ${newTx.description}, ${newTx.date}, ${newTx.created_at});
      `;
    } catch (e) {
      console.warn('Failed to insert into Neon DB, updated in-memory:', e);
    }
  }

  memoryTransactions.unshift(newTx);
  return newTx;
}

/**
 * Update transaction by ID with user_id authorization check (SRS-09 via AJAX PUT)
 */
export async function updateTransaction(
  id: string,
  userId: string,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
): Promise<{ success: boolean; transaction?: Transaction; error?: string; status: number }> {
  const existing = await getTransactionById(id);
  if (!existing) {
    return { success: false, error: 'Transaksi tidak ditemukan', status: 404 };
  }

  // SRS-05 Data Isolation: pengguna hanya dapat mengedit transaksinya sendiri
  if (existing.user_id !== userId) {
    return { success: false, error: 'Tidak memiliki izin mengubah transaksi pengguna lain', status: 403 };
  }

  const updated: Transaction = {
    ...existing,
    type: updates.type || existing.type,
    category: updates.category !== undefined ? updates.category.trim() : existing.category,
    amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    date: updates.date || existing.date,
  };

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      await sql`
        UPDATE transactions
        SET type = ${updated.type},
            category = ${updated.category},
            amount = ${updated.amount},
            description = ${updated.description},
            date = ${updated.date}
        WHERE id = ${id} AND user_id = ${userId};
      `;
    } catch (e) {
      console.warn('Failed to update Neon DB, updated in-memory:', e);
    }
  }

  const idx = memoryTransactions.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryTransactions[idx] = updated;
  }

  return { success: true, transaction: updated, status: 200 };
}

/**
 * Delete transaction by ID with user_id authorization check (SRS-10 via AJAX DELETE)
 */
export async function deleteTransaction(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string; status: number }> {
  const existing = await getTransactionById(id);
  if (!existing) {
    return { success: false, error: 'Transaksi tidak ditemukan', status: 404 };
  }

  // SRS-05 Data Isolation: jika userId diberikan, pastikan hanya bisa menghapus miliknya sendiri
  if (userId && existing.user_id !== userId) {
    return { success: false, error: 'Tidak memiliki izin menghapus transaksi pengguna lain', status: 403 };
  }

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      if (userId) {
        await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId};`;
      } else {
        await sql`DELETE FROM transactions WHERE id = ${id};`;
      }
    } catch (e) {
      console.warn('Failed to delete from Neon DB, deleted in-memory:', e);
    }
  }

  memoryTransactions = memoryTransactions.filter((t) => t.id !== id);
  return { success: true, status: 200 };
}
