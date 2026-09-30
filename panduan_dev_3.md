# Panduan & Dokumentasi Output Developer 3: DUITku (Pertemuan Lanjutan)

Dokumen ini disusun untuk **Developer 3**, **Project Manager (PM)**, dan **Asisten Praktikum (Asprak)** untuk menjelaskan hasil kerja, skenario pengujian AJAX, dan kesiapan integrasi fitur Developer 3.

---

## 1. Ringkasan Scope Developer 3

Sesuai **Dokumen Spesifikasi & Kontrak Tim (Bagian 14 & 16)**:
* **Peran**: Developer 3
* **Branch**: `feature/developer-3`
* **Status Scope**:
  * **SRS-12 (Menetapkan & Memperbarui Budget Bulanan via AJAX)**: **SELESAI**
  * **SRS-14 (Isolasi Data Budget per user_id)**: **SELESAI**
  * **SRS-11 (AJAX pada Transaksi & Modal Form)**: **SELESAI**

---

## 2. Struktur Berkas yang Dibuat & Dimodifikasi

```text
ppk-project-3/
├── types/
│   └── budget.ts                  # Kontrak tipe MonthlyBudget, BudgetFormData, BudgetUsageSummary
├── app/
│   └── api/
│       └── budgets/
│           └── route.ts           # Route Handler REST API AJAX (GET & POST) dengan upsert & data isolation
├── components/
│   ├── budget/
│   │   ├── BudgetModal.tsx        # UI Modal Form atur/edit budget via fetch('/api/budgets') AJAX
│   │   └── index.ts               # Barrel export components/budget
│   └── transactions/
│       └── TransactionModal.tsx   # Konversi submit tambah/edit transaksi ke fetch() AJAX REST API
└── scripts/
    └── test-dev3-budget.mjs       # Script uji otomatis 17 skenario validasi, batas nominal, dan isolasi data
```

---

## 3. Cara Pengujian (Testing) Langkah demi Langkah

### A. Pengujian Logika Otomatis (CLI / Terminal)
Jalankan di terminal IDE:
```bash
node scripts/test-dev3-budget.mjs
```
**Hasil yang Diharapkan:**
* `17 dari 17 pengujian berhasil (100% PASS)`
* Menguji validasi nominal `amount > 0`, format bulan `YYYY-MM`, isolasi data `u1`, `u2`, dan empty state `u3`, serta logika upsert (membuat vs memperbarui).

---

### B. Pengujian Endpoint REST API AJAX di Browser
Pastikan dev server berjalan (`npm run dev`), lalu buka tab baru di browser:

1. **Uji Isolasi Data u1 (Alya)**:
   * URL: `http://localhost:3000/api/budgets?userId=u1`
   * Respons JSON: Menampilkan array data budget `b1` sebesar Rp 500.000.
2. **Uji Filter Bulan Tertentu**:
   * URL: `http://localhost:3000/api/budgets?userId=u1&month=2025-02`
   * Respons JSON: Objek tunggal budget bulan Februari 2025.
3. **Uji Empty State User u3 (Citra Dewi)**:
   * URL: `http://localhost:3000/api/budgets?userId=u3`
   * Respons JSON: Array kosong `[]` (data terisolasi, Citra belum memiliki budget).

---

### C. Pengujian AJAX di Halaman Web via DevTools (Network Tab)
Untuk membuktikan bahwa interaksi berjalan secara **AJAX asinkron tanpa reload browser**:

1. Buka `http://localhost:3000` di Google Chrome / Edge.
2. Buka **Developer Tools** (Tekan tombol `F12` atau `Ctrl + Shift + I`).
3. Pilih tab **Network**, lalu klik filter **Fetch/XHR**.
4. Di halaman web, buka form modal tambah transaksi:
   * Isi jenis transaksi, nominal, kategori, dan tanggal.
   * Klik tombol **Simpan Transaksi**.
5. Amati di tab **Network**:
   * Muncul request berjenis `fetch` ke URL `/api/transactions` (atau fallback Server Action jika branch Dev 1 belum di-merge).
   * Status request: `200 OK`.
   * **Halaman browser TIDAK melakukan refresh/flicker sama sekali (Murni AJAX)**.

---

## 4. Panduan Integrasi untuk PM / Lead Dev

Komponen [BudgetModal](file:///c:/Users/Reynaldi%20Hutagaol/ppk-project-3/components/budget/BudgetModal.tsx) dirancang modular untuk di-mount di [app/dashboard/page.tsx](file:///c:/Users/Reynaldi%20Hutagaol/ppk-project-3/app/dashboard/page.tsx) saat fase integrasi:

```tsx
import { BudgetModal } from '@/components/budget';

// State di dashboard
const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

// JSX Modal
<BudgetModal
  isOpen={isBudgetModalOpen}
  userId={activeUser.id}
  currentMonth="2025-02"
  initialAmount={currentBudget?.amount}
  onClose={() => setIsBudgetModalOpen(false)}
  onSuccess={(updatedBudget, msg) => {
    // Reaktif memperbarui data tanpa reload
    setToastMessage(msg);
  }}
/>
```
