'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Pendaftaran gagal');
        setIsLoading(false);
        return;
      }

      // Auto-login flow as permitted in PRD Section 9
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
            Buat akun baru untuk mulai mencatat keuangan
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
              id="register-name"
              label="Nama Lengkap"
              type="text"
              autoComplete="name"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />

            <Input
              id="register-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@studentmail.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input
              id="register-password"
              label="Kata Sandi"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              helperText="Minimal 6 karakter"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Daftar Akun
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
