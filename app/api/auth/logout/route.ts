import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Error in logout API:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server saat logout' },
      { status: 500 }
    );
  }
}
