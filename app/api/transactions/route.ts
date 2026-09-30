import { NextRequest, NextResponse } from 'next/server';
import { getFilteredTransactions, createTransaction } from './transactions-store';

/**
 * GET /api/transactions
 * Mengambil daftar transaksi terfilter berdasarkan userId, month, type, dan category via AJAX (SRS-11, SRS-03, SRS-05)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month') || 'all';
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category') || 'all';

    // SRS-05: Isolasi Data Pengguna - userId wajib disertakan
    if (!userId || !userId.trim()) {
      return NextResponse.json(
        { error: 'Parameter userId wajib disertakan demi isolasi data pengguna (SRS-05)' },
        { status: 400 }
      );
    }

    const transactions = await getFilteredTransactions({
      userId,
      month,
      type,
      category,
    });

    return NextResponse.json({
      transactions,
      total: transactions.length,
      filters: {
        userId,
        month,
        type,
        category,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions via AJAX:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memuat data transaksi' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Menambah transaksi keuangan baru via AJAX (SRS-08, SRS-11)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, category, amount, description, date } = body;

    // Validasi field wajib
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'Field user_id wajib diisi' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json(
        { error: "Tipe transaksi harus bernilai 'income' atau 'expense'" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json(
        { error: 'Kategori transaksi wajib diisi' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal transaksi harus berupa angka lebih besar dari 0' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
      return NextResponse.json(
        { error: 'Tanggal transaksi wajib diisi dengan format YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const newTransaction = await createTransaction({
      user_id,
      type,
      category,
      amount: parsedAmount,
      description: description || '',
      date,
    });

    return NextResponse.json(
      {
        message: 'Transaksi berhasil ditambahkan',
        transaction: newTransaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction via AJAX:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat menyimpan transaksi' },
      { status: 500 }
    );
  }
}
