import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Login gagal' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Login berhasil',
      user: result.user,
    });
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server saat login' },
      { status: 500 }
    );
  }
}
