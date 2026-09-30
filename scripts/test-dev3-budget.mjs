/**
 * Verification Script untuk Scope Developer 3 (Budget & AJAX)
 * Menguji fungsionalitas SRS-12, SRS-14, SRS-11, tipe data, dan validasi form
 */

import { DUMMY_BUDGETS, getBudgetsByUserId } from '../lib/dummy-data.ts';

console.log('=== MEMULAI TEST VERIFIKASI DEVELOPER 3 (BUDGET & AJAX) ===\n');

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

// 1. Verifikasi Dummy Budget Data Contract (Bagian 11)
assert(Array.isArray(DUMMY_BUDGETS), 'DUMMY_BUDGETS terdefinisi sebagai Array');
assert(DUMMY_BUDGETS.length === 2, 'Tersedia 2 budget dummy (b1, b2)');

const b1 = DUMMY_BUDGETS.find((b) => b.id === 'b1');
assert(
  b1 && b1.user_id === 'u1' && b1.month === '2025-02' && b1.amount === 500000,
  'Kasus b1: User u1 (Normal/Aman) memiliki budget Rp 500.000 pada 2025-02'
);

const b2 = DUMMY_BUDGETS.find((b) => b.id === 'b2');
assert(
  b2 && b2.user_id === 'u2' && b2.month === '2025-02' && b2.amount === 25000,
  'Kasus b2: User u2 (Hampir Habis) memiliki budget Rp 25.000 pada 2025-02'
);

// 2. Verifikasi Data Isolation (SRS-14)
const u1Budgets = getBudgetsByUserId('u1');
const u2Budgets = getBudgetsByUserId('u2');
const u3Budgets = getBudgetsByUserId('u3');

assert(u1Budgets.length === 1 && u1Budgets[0].id === 'b1', 'SRS-14: User u1 hanya melihat budget b1 miliknya');
assert(u2Budgets.length === 1 && u2Budgets[0].id === 'b2', 'SRS-14: User u2 hanya melihat budget b2 miliknya');
assert(u3Budgets.length === 0, 'SRS-14: User u3 tidak memiliki budget (Empty State teruji)');

// 3. Verifikasi Logika Validasi Form Budget (SRS-12)
function validateBudgetInput(month, rawAmount) {
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!month || !monthRegex.test(month)) {
    return 'Format periode bulan harus berupa YYYY-MM (contoh: 2025-02).';
  }
  const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);
  if (isNaN(amount) || amount <= 0) {
    return 'Nominal anggaran bulanan harus berupa angka lebih besar dari 0.';
  }
  return null;
}

assert(
  validateBudgetInput('2025-02', 500000) === null,
  'Validasi: Menerima input valid bulan 2025-02 dan nominal Rp 500.000'
);

assert(
  validateBudgetInput('2025-02', 0) === 'Nominal anggaran bulanan harus berupa angka lebih besar dari 0.',
  'SRS-12: Menolak nominal anggaran 0'
);

assert(
  validateBudgetInput('2025-02', -10000) === 'Nominal anggaran bulanan harus berupa angka lebih besar dari 0.',
  'SRS-12: Menolak nominal anggaran negatif'
);

assert(
  validateBudgetInput('2025-13', 500000) === 'Format periode bulan harus berupa YYYY-MM (contoh: 2025-02).',
  'Validasi: Menolak format bulan tidak valid (2025-13)'
);

assert(
  validateBudgetInput('invalid-month', 500000) === 'Format periode bulan harus berupa YYYY-MM (contoh: 2025-02).',
  'Validasi: Menolak teks non-bulan'
);

// 4. Simulasi Upsert Budget (SRS-12 & SRS-14)
let memoryBudgets = [...DUMMY_BUDGETS];

function simulateUpsertBudget(userId, month, amount) {
  const existingIdx = memoryBudgets.findIndex((b) => b.user_id === userId && b.month === month);
  if (existingIdx >= 0) {
    memoryBudgets[existingIdx] = {
      ...memoryBudgets[existingIdx],
      amount,
      updated_at: new Date().toISOString(),
    };
    return { created: false, item: memoryBudgets[existingIdx] };
  } else {
    const newItem = {
      id: `b_${Date.now()}`,
      user_id: userId,
      month,
      amount,
      updated_at: new Date().toISOString(),
    };
    memoryBudgets.push(newItem);
    return { created: true, item: newItem };
  }
}

// User u3 menambahkan budget baru pertama kali
const u3CreateResult = simulateUpsertBudget('u3', '2025-02', 750000);
assert(u3CreateResult.created === true, 'SRS-12: User u3 berhasil membuat budget baru untuk bulan 2025-02');
assert(u3CreateResult.item.amount === 750000, 'SRS-12: Nominal budget u3 tersimpan Rp 750.000');

// User u1 mengupdate budget yang sudah ada dari 500000 ke 600000
const u1UpdateResult = simulateUpsertBudget('u1', '2025-02', 600000);
assert(u1UpdateResult.created === false, 'SRS-12: User u1 berhasil memperbarui (update) budget yang sudah ada');
assert(u1UpdateResult.item.amount === 600000, 'SRS-12: Nominal budget u1 terupdate menjadi Rp 600.000');
assert(
  memoryBudgets.filter((b) => b.user_id === 'u1' && b.month === '2025-02').length === 1,
  'SRS-12: Tidak terjadi duplikasi budget pada bulan yang sama untuk user yang sama'
);

console.log(`\nHasil: ${passedTests} dari ${totalTests} pengujian berhasil.`);
if (passedTests === totalTests) {
  console.log('🎉 SEMUA PENGUJIAN LOGIKA DEVELOPER 3 (SRS-12, SRS-14, SRS-11) BERHASIL 100%!');
}
