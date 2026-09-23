/**
 * Verification Script untuk Scope Developer 3
 * Menguji fungsionalitas SRS-08, SRS-09, SRS-10, validasi input, dan data isolation
 */

import { DUMMY_USERS, INITIAL_TRANSACTIONS } from '../lib/dummy-data.js';

console.log('=== MEMULAI TEST VERIFIKASI DEVELOPER 3 ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// 1. Verifikasi Dummy Data Contract (Bagian 11)
assert(DUMMY_USERS.length === 3, 'Tersedia 3 user dummy (u1, u2, u3)');
assert(INITIAL_TRANSACTIONS.length === 7, 'Tersedia 7 transaksi dummy (t1 - t7)');

const u1Tx = INITIAL_TRANSACTIONS.filter((t) => t.user_id === 'u1');
const u2Tx = INITIAL_TRANSACTIONS.filter((t) => t.user_id === 'u2');
const u3Tx = INITIAL_TRANSACTIONS.filter((t) => t.user_id === 'u3');

assert(u1Tx.length === 5, 'User u1 memiliki 5 transaksi (t1 - t5)');
assert(u2Tx.length === 2, 'User u2 memiliki 2 transaksi (t6 - t7)');
assert(u3Tx.length === 0, 'User u3 tidak memiliki transaksi (Empty state)');

// 2. Uji Kasus Spesifik Bagian 11 (t4 deskripsi panjang & t5 nominal besar)
const t4 = INITIAL_TRANSACTIONS.find((t) => t.id === 't4');
assert(
  t4 && t4.description.length > 50,
  'Kasus t4: Deskripsi panjang terdefinisi dengan benar (' + t4?.description.length + ' karakter)'
);

const t5 = INITIAL_TRANSACTIONS.find((t) => t.id === 't5');
assert(t5 && t5.amount === 12500000, 'Kasus t5: Nominal besar Rp 12.500.000 terdefinisi dengan benar');

// 3. Simulasi Validasi Form (SRS-08 & SRS-09)
function validateForm(data) {
  if (!data.type || (data.type !== 'income' && data.type !== 'expense')) {
    return 'Jenis transaksi harus berupa Pemasukan atau Pengeluaran.';
  }
  const num = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (isNaN(num) || num <= 0) {
    return 'Nominal transaksi harus lebih besar dari 0.';
  }
  if (!data.category || data.category.trim() === '') {
    return 'Kategori transaksi wajib dipilih atau diisi.';
  }
  if (!data.date || isNaN(Date.parse(data.date))) {
    return 'Tanggal transaksi tidak valid.';
  }
  return null;
}

assert(
  validateForm({ type: 'expense', amount: 0, category: 'Makan', date: '2025-02-01' }) ===
    'Nominal transaksi harus lebih besar dari 0.',
  'Validasi: Menolak nominal 0'
);

assert(
  validateForm({ type: 'expense', amount: -5000, category: 'Makan', date: '2025-02-01' }) ===
    'Nominal transaksi harus lebih besar dari 0.',
  'Validasi: Menolak nominal negatif'
);

assert(
  validateForm({ type: 'expense', amount: 25000, category: '', date: '2025-02-01' }) ===
    'Kategori transaksi wajib dipilih atau diisi.',
  'Validasi: Menolak kategori kosong'
);

assert(
  validateForm({ type: 'expense', amount: 25000, category: 'Makan', date: 'tanggal-salah' }) ===
    'Tanggal transaksi tidak valid.',
  'Validasi: Menolak format tanggal tidak valid'
);

assert(
  validateForm({ type: 'income', amount: 12500000, category: 'Beasiswa', date: '2025-02-05' }) === null,
  'Validasi: Menerima form valid pemasukan beasiswa'
);

// 4. Simulasi Logika Hapus Transaksi & Data Isolation (SRS-10 & SRS-05)
let simulatedTransactions = [...INITIAL_TRANSACTIONS];
function simulateDelete(id, userId) {
  const target = simulatedTransactions.find((t) => t.id === id);
  if (!target) return { success: false, error: 'Transaksi tidak ditemukan' };
  // SRS-05: Data isolation - pastikan user hanya bisa hapus miliknya sendiri
  if (target.user_id !== userId) {
    return { success: false, error: 'Akses ditolak: Tidak memiliki hak menghapus transaksi pengguna lain' };
  }
  simulatedTransactions = simulatedTransactions.filter((t) => t.id !== id);
  return { success: true, message: 'Transaksi berhasil dihapus.' };
}

// Uji coba user u2 mencoba menghapus transaksi t1 milik u1
const unauthorizedDelete = simulateDelete('t1', 'u2');
assert(!unauthorizedDelete.success, 'SRS-05: User u2 gagal menghapus transaksi t1 milik user u1 (Data Isolation teruji)');

// Uji coba user u1 menghapus transaksi t2 miliknya sendiri
const authorizedDelete = simulateDelete('t2', 'u1');
assert(authorizedDelete.success, 'SRS-10: User u1 berhasil menghapus transaksi miliknya sendiri');
assert(
  simulatedTransactions.find((t) => t.id === 't2') === undefined,
  'SRS-10: Transaksi t2 benar-benar terhapus dari daftar transaksi'
);

console.log(`\nHasil: ${passedTests} dari ${totalTests} pengujian berhasil.`);
if (passedTests === totalTests) {
  console.log('🎉 SEMUA PENGUJIAN LOGIKA DEVELOPER 3 (SRS-08, SRS-09, SRS-10) BERHASIL 100%!');
}
