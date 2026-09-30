/**
 * Kontrak Tipe Entitas Budget Bulanan (SRS-12, SRS-13, SRS-14)
 * Developer 3 Scope - DUITku Application
 */

export interface MonthlyBudget {
  id: string; // "b1", "b2"
  user_id: string; // relasi ke User.id (SRS-14 Data Isolation)
  month: string; // "YYYY-MM" (contoh: "2025-02")
  amount: number; // batas anggaran pengeluaran bulanan (> 0)
  updated_at: string; // ISO timestamp
}

export interface BudgetFormData {
  month: string; // "YYYY-MM"
  amount: number; // nominal batas anggaran (> 0)
}

export interface BudgetUsageSummary {
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'over';
}

export interface BudgetApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
