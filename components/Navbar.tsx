'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

export interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-[#0F172A] tracking-tight">
            DUIT<span className="text-[#2563EB]">ku</span>
          </span>
        </div>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#0F172A] leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-[#64748B]">{user.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              className="text-xs py-1.5 px-3"
            >
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
