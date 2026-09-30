import type { MonthlyBudget, Transaction } from './dummy-data';

export type BudgetStatus = 'safe' | 'warning' | 'over' | 'none';

export interface BudgetUsageSummary {
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  status: BudgetStatus;
  hasBudget: boolean;
}

/**
 * Menghitung penggunaan anggaran bulanan berdasarkan transaksi pengeluaran (SRS-13)
 * dengan isolasi data per pengguna (SRS-14).
 *
 * Status:
 * - safe: pemakaian < 80% (Aman)
 * - warning: pemakaian 80% - 99.9% (Hampir Habis)
 * - over: pemakaian >= 100% (Melebihi Anggaran)
 * - none: belum ada anggaran ditetapkan
 */
export function calculateBudgetUsage(
  budget: MonthlyBudget | null | undefined,
  transactions: Transaction[],
  month: string
): BudgetUsageSummary {
  const usedAmount = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);

  if (!budget || budget.amount <= 0) {
    return {
      budgetAmount: 0,
      usedAmount,
      remainingAmount: -usedAmount,
      usagePercentage: 0,
      status: 'none',
      hasBudget: false,
    };
  }

  const budgetAmount = budget.amount;
  const remainingAmount = budgetAmount - usedAmount;
  const usagePercentage = (usedAmount / budgetAmount) * 100;

  let status: BudgetStatus = 'safe';
  if (usagePercentage >= 100) {
    status = 'over';
  } else if (usagePercentage >= 80) {
    status = 'warning';
  }

  return {
    budgetAmount,
    usedAmount,
    remainingAmount,
    usagePercentage,
    status,
    hasBudget: true,
  };
}
