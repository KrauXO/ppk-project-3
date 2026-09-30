# Panduan & Dokumentasi Output Developer 2: DUITku

Dokumen ini disusun khusus untuk **Project Manager (PM) / Lead Developer / Integrator AI** untuk menjelaskan hasil kerja, struktur kode, proses pengujian, dan kesiapan penggabungan (*merge*) fitur dari **Developer 2**.

---

## 1. Ringkasan Eksekutif & Scope Kerja

Sesuai dengan SRS DUITku dan hasil re-evaluasi kerja tim:
* **Peran**: Developer 2
* **Branch**: `feature/developer-2`
* **Status Scope**:
  * **SRS-04 (Ringkasan Keuangan)**: **SELESAI** (Kartu Saldo Bersih, Total Pemasukan, Total Pengeluaran).
  * **SRS-03 (Riwayat Transaksi)**: **SELESAI** (Tabel riwayat transaksi + Empty State).
  * **SRS-05 (Isolasi Data Pengguna)**: **SELESAI** (Data difilter mutlak berdasarkan `user_id` user yang login).
  * **SRS-07 (Cookie Preferensi Tampilan Saldo)**: **SELESAI** (Preferensi format angka Rupiah disimpan dalam cookie browser `duitku_balance_format` dan bertahan saat refresh/re-open).
  * **SRS-10 (Hapus Transaksi)**: **DIKELUARKAN DARI SCOPE DEV 2** (Dihapus dari tanggung jawab Dev 2 sesuai instruksi pembagian ulang tim; Dev 2 tidak membuat tombol/modal/mutasi hapus).
  * **SRS-13 (Pemantauan Budget Bulanan)**: **SELESAI [PERTEMUAN LANJUTAN]** (Kalkulasi akumulasi pengeluaran bulanan `type === "expense"`, progress bar, status Aman / Hampir Habis / Melebihi Anggaran).
  * **SRS-14 (Isolasi Data Budget Pengguna)**: **SELESAI [PERTEMUAN LANJUTAN]** (Anggaran dan kalkulasi difilter ketat per `user_id`).

---

## 2. Struktur Berkas & Komponen Modular

Untuk mencegah konflik saat *merging* ([CONFLICT RISK]), Developer 2 memecah seluruh fitur ke dalam komponen-komponen terisolasi:

```text
ppk-project-3/
├── lib/
│   ├── dummy-data.ts           # Kontrak data tim (User u1..u3, Transaksi t1..t7, MonthlyBudget b1..b2)
│   ├── cookie-preference.ts    # Helper baca/tulis cookie preferensi format saldo Rupiah & formatter
│   └── budget-utils.ts         # [BARU] Helper kalkulasi pemakaian budget bulanan (SRS-13, SRS-14)
├── components/
│   ├── dashboard/
│   │   ├── SummaryCards.tsx    # 3 kartu ringkasan keuangan + UI switch preferensi cookie (SRS-04, SRS-07)
│   │   └── TransactionTable.tsx# Tabel riwayat transaksi + Empty State (SRS-03, SRS-05)
│   └── budget/
│       ├── BudgetMonitorCard.tsx# [BARU] Panel pemantauan budget bulanan (SRS-13, SRS-14, SRS-07)
│       └── index.ts            # [BARU] Export point komponen budget
├── scripts/
│   └── test-budget.mjs         # [BARU] Runnable test verifikasi kalkulasi matematika budget
└── app/
    └── dashboard/
        └── page.tsx            # Container halaman dashboard modular (PM Integrator)
```

---

## 3. Hasil Validasi Matematis & Data Uji (Baseline Dokumen PDF)

### A. Ringkasan Keuangan (SRS-04)
Perhitungan pada data uji pengguna `u1` (Alya Putri):
* **Pemasukan**: `t1` (Rp 2.000.000) + `t5` (Rp 12.500.000) = **Rp 14.500.000** (VALID)
* **Pengeluaran**: `t2` (Rp 25.000) + `t3` (Rp 15.000) + `t4` (Rp 150.000) = **Rp 190.000** (VALID)
* **Saldo Bersih**: 14.500.000 - 190.000 = **Rp 14.310.000** (VALID)

### B. Pemantauan Budget Bulanan (SRS-13, SRS-14) - [PERTEMUAN LANJUTAN]
1. **User `u1` (Kondisi Normal / Aman - Periode 2025-02)**:
   * Anggaran Bulanan (`b1`): Rp 500.000
   * Terpakai (Akumulasi Pengeluaran t2 + t3 + t4): Rp 190.000
   * Sisa Anggaran: Rp 310.000
   * Persentase Pemakaian: **38%**
   * Status: **Aman** (`safe`, badge hijau `#16A34A`, bar hijau) — **100% VALID**
2. **User `u2` (Kondisi Warning / Hampir Habis 80% - Periode 2025-02)**:
   * Anggaran Bulanan (`b2`): Rp 25.000
   * Terpakai (Akumulasi Pengeluaran t6): Rp 20.000
   * Sisa Anggaran: Rp 5.000
   * Persentase Pemakaian: **80%**
   * Status: **Hampir Habis** (`warning`, badge amber `#D97706`, bar kuning/amber) — **100% VALID**
3. **User `u3` (Kondisi Data Kosong / Empty State)**:
   * Belum memiliki data budget di `DUMMY_BUDGETS`
   * Menampilkan Empty State: *"Belum ada anggaran pengeluaran untuk bulan ini"* + tombol *"Tetapkan Anggaran"* — **100% VALID**
4. **Edge Case: Over Budget (>= 100%)**:
   * Jika pemakaian >= 100%, Sisa Anggaran bertanda negatif merah dan status **Melebihi Anggaran** (`over`, badge merah `#DC2626`, bar merah) — **100% VALID**

---

## 4. Panduan Pengujian Manual untuk PM / Lead Dev

1. **Jalankan Verifikasi Otomatis**:
   ```bash
   node scripts/test-budget.mjs
   npm run lint
   npm run build
   ```
   *Hasil: Seluruh kalkulasi pass 100%, linting 0 error, build lulus.*

2. **Mounting Komponen Budget di Dashboard**:
   Letakkan komponen `<BudgetMonitorCard />` tepat di bawah `<SummaryCards />` sesuai hirarki Bagian 5 PDF.

---

## 5. Integration Contract (Sesuai Bagian 25 Dokumen Tim)

```text
Developer            : Developer 2 - Pair Programming
Feature              : Kalkulasi & UI Pemantauan Budget Bulanan (SRS-13, SRS-14, SRS-07)
Branch               : feature/developer-2
Files added          : lib/budget-utils.ts, components/budget/BudgetMonitorCard.tsx, components/budget/index.ts, scripts/test-budget.mjs
Files modified       : panduan_dev_2.md
Files deleted        : None
Dependencies added   : None (Native React & standard library)
Routes added         : None
Components added     : BudgetMonitorCard
Database changes     : None (menunggu skema budgets dari PM / Dev 3)
Shared files modified: No (lib/dummy-data.ts tetap read-only)
Conflict risk        : Low (komponen terisolasi murni di components/budget/)
Integration notes    : Siap di-mount di app/dashboard/page.tsx:
                       <BudgetMonitorCard
                         budget={activeBudget}
                         transactions={userTransactions}
                         selectedMonth={selectedMonth}
                         onMonthChange={setSelectedMonth}
                         onOpenBudgetModal={handleOpenBudgetModal}
                         formatPreference={formatPreference}
                       />
Testing performed    : node scripts/test-budget.mjs (100% PASS), npm run lint (0 error), npm run build (Compiled successfully)
Known limitations    : Perhitungan akumulasi berbasis filter transaksi type === 'expense' dan date.startsWith(month) sesuai batas spesifikasi SRS.
```

---

*Disiapkan dengan disiplin tinggi oleh Developer 2.*
