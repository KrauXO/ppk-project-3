import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const result = await registerUser({ name, email, password });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Pendaftaran gagal' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Pendaftaran berhasil',
      user: result.user,
    });
  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server saat registrasi' },
      { status: 500 }
    );
  }
}
