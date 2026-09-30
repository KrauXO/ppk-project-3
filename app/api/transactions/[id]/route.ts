import { NextRequest, NextResponse } from 'next/server';
import { updateTransaction, deleteTransaction, getTransactionById } from '../transactions-store';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * PUT /api/transactions/[id]
 * Memperbarui transaksi keuangan via AJAX (SRS-09, SRS-11, SRS-05)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi wajib disertakan' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { user_id, type, category, amount, description, date } = body;

    // SRS-05: Isolasi Data Pengguna - user_id wajib diverifikasi
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'Field user_id wajib diisi untuk verifikasi hak akses transaksi (SRS-05)' },
        { status: 400 }
      );
    }

    if (type && type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: "Tipe transaksi harus bernilai 'income' atau 'expense'" },
        { status: 400 }
      );
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json(
          { error: 'Nominal transaksi harus berupa angka lebih besar dari 0' },
          { status: 400 }
        );
      }
    }

    const result = await updateTransaction(id, user_id, {
      type,
      category,
      amount,
      description,
      date,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
      data: result.transaction,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error updating transaction via AJAX PUT:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memperbarui transaksi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/[id]
 * Menghapus transaksi keuangan via AJAX (SRS-10, SRS-11, SRS-05)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi wajib disertakan' },
        { status: 400 }
      );
    }

    // Ambil userId dari searchParams atau request body (jika ada) demi isolasi data SRS-05
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId') || undefined;

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.user_id || body.userId;
      } catch {
        // Body opsional jika userId sudah ada di URL
      }
    }

    const result = await deleteTransaction(id, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting transaction via AJAX DELETE:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat menghapus transaksi' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transactions/[id]
 * Mengambil detail satu transaksi via AJAX
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { id } = resolvedParams;

    const tx = await getTransactionById(id);
    if (!tx) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction: tx });
  } catch (error) {
    console.error('Error fetching single transaction:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
