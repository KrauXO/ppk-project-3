import assert from 'node:assert';
import { calculateBudgetUsage } from '../lib/budget-utils.ts';
import { DUMMY_BUDGETS, DUMMY_TRANSACTIONS, getTransactionsByUserId } from '../lib/dummy-data.ts';

console.log('=== MEMULAI TEST VERIFIKASI BUDGET BULANAN (DEV 2) ===\n');

// 1. Uji Kasus b1 (User u1 - Alya Putri, Normal / Aman)
const u1Transactions = getTransactionsByUserId('u1', DUMMY_TRANSACTIONS);
const u1Budget = DUMMY_BUDGETS.find((b) => b.user_id === 'u1' && b.month === '2025-02');
const u1Usage = calculateBudgetUsage(u1Budget, u1Transactions, '2025-02');

console.log('1. Uji Kasus User u1 (Normal):');
console.log('   - Anggaran:', u1Usage.budgetAmount);
console.log('   - Terpakai:', u1Usage.usedAmount);
console.log('   - Sisa:', u1Usage.remainingAmount);
console.log('   - Persentase:', Math.round(u1Usage.usagePercentage) + '%');
console.log('   - Status:', u1Usage.status);

assert.strictEqual(u1Usage.hasBudget, true, 'u1 harus memiliki budget');
assert.strictEqual(u1Usage.budgetAmount, 500000, 'Anggaran u1 harus 500.000');
assert.strictEqual(u1Usage.usedAmount, 190000, 'Pengeluaran u1 harus 190.000');
assert.strictEqual(u1Usage.remainingAmount, 310000, 'Sisa u1 harus 310.000');
assert.strictEqual(Math.round(u1Usage.usagePercentage), 38, 'Persentase u1 harus 38%');
assert.strictEqual(u1Usage.status, 'safe', 'Status u1 harus safe (Aman)');
console.log('   ✅ PASS u1 (Aman)\n');

// 2. Uji Kasus b2 (User u2 - Bima Saputra, Warning / Hampir Habis 80%)
const u2Transactions = getTransactionsByUserId('u2', DUMMY_TRANSACTIONS);
const u2Budget = DUMMY_BUDGETS.find((b) => b.user_id === 'u2' && b.month === '2025-02');
const u2Usage = calculateBudgetUsage(u2Budget, u2Transactions, '2025-02');

console.log('2. Uji Kasus User u2 (Warning):');
console.log('   - Anggaran:', u2Usage.budgetAmount);
console.log('   - Terpakai:', u2Usage.usedAmount);
console.log('   - Sisa:', u2Usage.remainingAmount);
console.log('   - Persentase:', Math.round(u2Usage.usagePercentage) + '%');
console.log('   - Status:', u2Usage.status);

assert.strictEqual(u2Usage.hasBudget, true, 'u2 harus memiliki budget');
assert.strictEqual(u2Usage.budgetAmount, 25000, 'Anggaran u2 harus 25.000');
assert.strictEqual(u2Usage.usedAmount, 20000, 'Pengeluaran u2 harus 20.000');
assert.strictEqual(u2Usage.remainingAmount, 5000, 'Sisa u2 harus 5.000');
assert.strictEqual(Math.round(u2Usage.usagePercentage), 80, 'Persentase u2 harus 80%');
assert.strictEqual(u2Usage.status, 'warning', 'Status u2 harus warning (Hampir Habis)');
console.log('   ✅ PASS u2 (Hampir Habis)\n');

// 3. Uji Kasus User u3 (Citra Dewi - Empty State / Belum ada anggaran)
const u3Transactions = getTransactionsByUserId('u3', DUMMY_TRANSACTIONS);
const u3Budget = DUMMY_BUDGETS.find((b) => b.user_id === 'u3' && b.month === '2025-02');
const u3Usage = calculateBudgetUsage(u3Budget, u3Transactions, '2025-02');

console.log('3. Uji Kasus User u3 (Empty State):');
console.log('   - Has Budget:', u3Usage.hasBudget);
console.log('   - Status:', u3Usage.status);

assert.strictEqual(u3Usage.hasBudget, false, 'u3 tidak boleh memiliki budget');
assert.strictEqual(u3Usage.status, 'none', 'Status u3 harus none');
assert.strictEqual(u3Usage.budgetAmount, 0, 'Budget u3 harus 0');
assert.strictEqual(u3Usage.usedAmount, 0, 'Pengeluaran u3 harus 0');
console.log('   ✅ PASS u3 (Empty State)\n');

// 4. Uji Kasus Edge Case (Over Budget >= 100%)
const overBudget = { id: 'test_over', user_id: 'test', month: '2025-02', amount: 100000, updated_at: '' };
const overTx = [
  { id: 'tx_over', user_id: 'test', type: 'expense', category: 'Lainnya', amount: 120000, description: 'Test', date: '2025-02-10', created_at: '' }
];
const overUsage = calculateBudgetUsage(overBudget, overTx, '2025-02');

console.log('4. Uji Kasus Over Budget (>= 100%):');
console.log('   - Anggaran:', overUsage.budgetAmount);
console.log('   - Terpakai:', overUsage.usedAmount);
console.log('   - Sisa:', overUsage.remainingAmount);
console.log('   - Persentase:', Math.round(overUsage.usagePercentage) + '%');
console.log('   - Status:', overUsage.status);

assert.strictEqual(overUsage.status, 'over', 'Status harus over (Melebihi Anggaran)');
assert.strictEqual(overUsage.remainingAmount, -20000, 'Sisa harus bernilai negatif');
assert.strictEqual(overUsage.usagePercentage, 120, 'Persentase harus 120%');
console.log('   ✅ PASS Over Budget\n');

console.log('🎉 SEMUA PENGUJIAN LOGIKA BUDGET DEV 2 BERHASIL 100%!');
