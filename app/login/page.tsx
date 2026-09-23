'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal, periksa email dan kata sandi');
        setIsLoading(false);
        return;
      }

      // Successful login -> navigate to dashboard
      router.push('/');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* App Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#0F172A] tracking-tight">
            DUIT<span className="text-[#2563EB]">ku</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Masuk untuk mengelola keuangan Anda
          </p>
        </div>

        {/* Card Form */}
        <div
          style={{ borderRadius: '6px' }}
          className="bg-white border border-[#E2E8F0] p-6 shadow-none"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert type="error" message={error} />}

            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@studentmail.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input
              id="login-password"
              label="Kata Sandi"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Masuk
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Belum memiliki akun?{' '}
            <Link
              href="/register"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>

        {/* Helper Dummy Accounts Info for Testing */}
        <div className="mt-6 p-3 bg-white border border-[#E2E8F0] text-xs text-[#64748B] rounded-[6px]">
          <p className="font-medium text-[#0F172A] mb-1">Akun Uji Coba (Dummy):</p>
          <p>• alya@studentmail.id (password123)</p>
          <p>• bima@studentmail.id (password123)</p>
          <p>• citra@studentmail.id (password123)</p>
        </div>
      </div>
    </div>
  );
}
