import { useSyncExternalStore, useCallback } from 'react';

export type BalanceFormatPreference = 'with_symbol' | 'without_symbol';

export const COOKIE_NAME_BALANCE_FORMAT = 'duitku_balance_format';
export const DEFAULT_BALANCE_FORMAT: BalanceFormatPreference = 'with_symbol';
const COOKIE_CHANGE_EVENT = 'duitku_cookie_change';

/**
 * Membaca nilai cookie dari document.cookie di client-side
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Menyimpan nilai cookie ke document.cookie dengan masa berlaku default 30 hari (SRS-07)
 */
export function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  window.dispatchEvent(new Event(COOKIE_CHANGE_EVENT));
}

/**
 * Membaca preferensi format tampilan saldo pengguna dari cookie
 */
export function getBalanceFormatPreference(): BalanceFormatPreference {
  const saved = getCookie(COOKIE_NAME_BALANCE_FORMAT);
  if (saved === 'without_symbol' || saved === 'with_symbol') {
    return saved;
  }
  return DEFAULT_BALANCE_FORMAT;
}

/**
 * React Hook untuk membaca & memperbarui preferensi format saldo secara reaktif
 * menggunakan useSyncExternalStore (React 19 compliant, bebas cascading render)
 */
export function useBalanceFormatPreference(): [
  BalanceFormatPreference,
  (pref: BalanceFormatPreference) => void
] {
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(COOKIE_CHANGE_EVENT, callback);
    return () => window.removeEventListener(COOKIE_CHANGE_EVENT, callback);
  }, []);

  const getSnapshot = () => getBalanceFormatPreference();
  const getServerSnapshot = () => DEFAULT_BALANCE_FORMAT;

  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updatePreference = useCallback((newPref: BalanceFormatPreference) => {
    setCookie(COOKIE_NAME_BALANCE_FORMAT, newPref);
  }, []);

  return [preference, updatePreference];
}

/**
 * Memformat angka nominal uang sesuai preferensi format saldo Rupiah (SRS-07 & SRS-04)
 * @param amount Nominal angka (misal: 14310000 atau -190000)
 * @param format Preferensi format: 'with_symbol' (Rp 14.310.000) | 'without_symbol' (14.310.000)
 */
export function formatCurrency(
  amount: number,
  format: BalanceFormatPreference = DEFAULT_BALANCE_FORMAT
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format angka pemisah ribuan titik standar Indonesia
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (format === 'without_symbol') {
    return isNegative ? `-${formattedNumber}` : formattedNumber;
  }

  // Format standar dengan "Rp"
  return isNegative ? `-Rp ${formattedNumber}` : `Rp ${formattedNumber}`;
}
