import { NextRequest, NextResponse } from 'next/server';
import { MonthlyBudget } from '@/types/budget';
import { DUMMY_BUDGETS } from '@/lib/dummy-data';
import { sql } from '@/lib/db';

// Fallback in-memory storage yang disinkronkan dengan DUMMY_BUDGETS (SRS-14)
let memoryBudgets: MonthlyBudget[] = [...DUMMY_BUDGETS];
let budgetsDbInitialized = false;

/**
 * Inisialisasi tabel budgets di database PostgreSQL jika tersedia
 */
async function ensureBudgetsDbInitialized(): Promise<boolean> {
  if (budgetsDbInitialized) return true;
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || dbUrl.includes('user:password@host/dbname')) {
      return false;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        month VARCHAR(10) NOT NULL,
        amount NUMERIC NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, month)
      );
    `;

    // Seed data default jika tabel masih kosong
    const countResult = await sql`SELECT COUNT(*)::int as count FROM budgets;`;
    if (countResult[0]?.count === 0) {
      for (const b of DUMMY_BUDGETS) {
        await sql`
          INSERT INTO budgets (id, user_id, month, amount, updated_at)
          VALUES (${b.id}, ${b.user_id}, ${b.month}, ${b.amount}, ${b.updated_at})
          ON CONFLICT (user_id, month) DO NOTHING;
        `;
      }
    }

    budgetsDbInitialized = true;
    return true;
  } catch (err) {
    console.warn('Peringatan: Database PostgreSQL budgets belum terjangkau, menggunakan fallback in-memory:', err);
    return false;
  }
}

/**
 * GET /api/budgets
 * Query params:
 *   - userId (wajib): ID user aktif untuk isolasi data (SRS-14)
 *   - month (opsional): Format 'YYYY-MM' untuk mengambil anggaran bulan tertentu
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || searchParams.get('user_id');
    const month = searchParams.get('month');

    // Validasi parameter userId (SRS-14 Isolasi Data)
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter userId wajib disertakan untuk isolasi data anggaran.',
        },
        { status: 400 }
      );
    }

    // 1. Coba ambil dari Database PostgreSQL
    const isDbReady = await ensureBudgetsDbInitialized();
    if (isDbReady) {
      try {
        if (month) {
          const rows = await sql`
            SELECT id, user_id, month, amount, updated_at
            FROM budgets
            WHERE user_id = ${userId} AND month = ${month}
            LIMIT 1;
          `;
          if (rows.length > 0) {
            const item: MonthlyBudget = {
              id: String(rows[0].id),
              user_id: String(rows[0].user_id),
              month: String(rows[0].month),
              amount: Number(rows[0].amount),
              updated_at: new Date(rows[0].updated_at).toISOString(),
            };
            return NextResponse.json({ success: true, data: item });
          }
          return NextResponse.json({ success: true, data: null });
        } else {
          const rows = await sql`
            SELECT id, user_id, month, amount, updated_at
            FROM budgets
            WHERE user_id = ${userId}
            ORDER BY month DESC;
          `;
          const items: MonthlyBudget[] = rows.map((r) => ({
            id: String(r.id),
            user_id: String(r.user_id),
            month: String(r.month),
            amount: Number(r.amount),
            updated_at: new Date(r.updated_at).toISOString(),
          }));
          return NextResponse.json({ success: true, data: items });
        }
      } catch (dbErr) {
        console.warn('Gagal membaca dari database budgets, beralih ke in-memory:', dbErr);
      }
    }

    // 2. Fallback in-memory
    if (month) {
      const found = memoryBudgets.find((b) => b.user_id === userId && b.month === month) || null;
      return NextResponse.json({ success: true, data: found });
    }

    const userBudgets = memoryBudgets.filter((b) => b.user_id === userId);
    return NextResponse.json({ success: true, data: userBudgets });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat memuat budget.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/budgets
 * Menetapkan atau memperbarui (upsert) nominal anggaran bulanan (SRS-12, SRS-14)
 * Body: { user_id: string, month: string, amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || body.userId;
    const month = body.month?.trim();
    const rawAmount = body.amount;

    // Validasi user_id (SRS-14 Isolasi Data)
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'User ID wajib disertakan untuk isolasi data anggaran.' },
        { status: 400 }
      );
    }

    // Validasi format bulan YYYY-MM
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!month || !monthRegex.test(month)) {
      return NextResponse.json(
        { success: false, error: 'Format periode bulan harus berupa YYYY-MM (contoh: 2025-02).' },
        { status: 400 }
      );
    }

    // Validasi nominal anggaran (SRS-12: nominal > 0)
    const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Nominal anggaran bulanan harus berupa angka lebih besar dari 0.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    // 1. Coba simpan ke PostgreSQL via upsert
    const isDbReady = await ensureBudgetsDbInitialized();
    if (isDbReady) {
      try {
        const newId = `b_${Date.now()}`;
        const rows = await sql`
          INSERT INTO budgets (id, user_id, month, amount, updated_at)
          VALUES (${newId}, ${userId}, ${month}, ${amount}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, month)
          DO UPDATE SET amount = EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP
          RETURNING id, user_id, month, amount, updated_at;
        `;

        if (rows.length > 0) {
          const savedBudget: MonthlyBudget = {
            id: String(rows[0].id),
            user_id: String(rows[0].user_id),
            month: String(rows[0].month),
            amount: Number(rows[0].amount),
            updated_at: new Date(rows[0].updated_at).toISOString(),
          };

          // Sinkronkan juga ke state memory
          const memIdx = memoryBudgets.findIndex((b) => b.user_id === userId && b.month === month);
          if (memIdx >= 0) {
            memoryBudgets[memIdx] = savedBudget;
          } else {
            memoryBudgets.push(savedBudget);
          }

          return NextResponse.json({
            success: true,
            message: 'Anggaran bulanan berhasil disimpan.',
            data: savedBudget,
          });
        }
      } catch (dbErr) {
        console.warn('Gagal menyimpan ke PostgreSQL budgets, beralih ke in-memory:', dbErr);
      }
    }

    // 2. Fallback in-memory upsert
    const existingIndex = memoryBudgets.findIndex((b) => b.user_id === userId && b.month === month);
    let resultBudget: MonthlyBudget;

    if (existingIndex >= 0) {
      memoryBudgets[existingIndex] = {
        ...memoryBudgets[existingIndex],
        amount,
        updated_at: nowIso,
      };
      resultBudget = memoryBudgets[existingIndex];
    } else {
      resultBudget = {
        id: `b_${Date.now()}`,
        user_id: userId,
        month,
        amount,
        updated_at: nowIso,
      };
      memoryBudgets.push(resultBudget);
    }

    return NextResponse.json({
      success: true,
      message: 'Anggaran bulanan berhasil disimpan.',
      data: resultBudget,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat menyimpan anggaran.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
