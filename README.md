# DUITku — Expense Tracker

Aplikasi web berbasis **Next.js (App Router)** dan **PostgreSQL (Neon)** untuk membantu mahasiswa mencatat pemasukan, pengeluaran, memantau kondisi keuangan pribadi, serta mengelola anggaran pengeluaran bulanan (*Monthly Budget*) secara *real-time* menggunakan **AJAX**.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [SRS (Software Requirement Specification)](#srs-software-requirement-specification)
- [Halaman & Endpoint API](#halaman--endpoint-api)
- [Role & Tim](#role--tim)
- [Struktur Proyek & Branch](#struktur-proyek--branch)
- [Cara Menjalankan Project & Pengujian](#cara-menjalankan-project--pengujian)

---

## Tentang Project

**DUITku** memungkinkan pengguna (mahasiswa) untuk:
- Membuat akun & masuk (*login*) dengan autentikasi berbasis *session cookie* (`HttpOnly`).
- Mencatat, mengubah, dan menghapus transaksi keuangan (pemasukan/pengeluaran) tanpa *reload* halaman penuh (AJAX).
- Menyaring (*filter*) riwayat transaksi berdasarkan **Bulan**, **Tipe Transaksi**, dan **Kategori** secara dinamis via AJAX.
- Memantau **Saldo Bersih**, **Total Pemasukan**, dan **Total Pengeluaran** secara *real-time* dengan preferensi format nominal Rupiah yang disimpan di *Cookie Browser*.
- Menetapkan dan memantau **Anggaran Bulanan (*Monthly Budget*)** lengkap dengan indikator *progress bar* dan status (*Aman*, *Hampir Habis*, *Melebihi Budget*).

Scope dikerjakan **ketat sesuai SRS (`SRS-01` s.d. `SRS-14`)** — tidak ada fitur tambahan di luar *requirement*.

---

## SRS (Software Requirement Specification)

| Kode | Requirement |
|---|---|
| `SRS-01` | Pengguna dapat membuat akun (*Register*) |
| `SRS-02` | Pengguna dapat masuk (*Login*) ke aplikasi |
| `SRS-03` | Pengguna dapat melihat transaksi & riwayat transaksi |
| `SRS-04` | Pengguna dapat mengetahui kondisi keuangan melalui saldo bersih, total pemasukan, dan total pengeluaran |
| `SRS-05` | Data transaksi terhubung dengan pengguna yang login — setiap pengguna hanya dapat mengakses & mengelola data miliknya sendiri (*Data Isolation*) |
| `SRS-06` | Aplikasi mempertahankan informasi login pengguna selama *session* masih berlaku |
| `SRS-07` | Aplikasi menggunakan *cookies* untuk menyimpan minimal satu preferensi pengguna — **ditetapkan: format tampilan saldo (Simbol Lengkap `Rp` vs Angka Saja)** |
| `SRS-08` | Pengguna dapat menambahkan transaksi keuangan baru |
| `SRS-09` | Pengguna dapat mengubah (*edit*) data transaksi keuangan |
| `SRS-10` | Pengguna dapat menghapus transaksi keuangan dengan konfirmasi |
| `SRS-11` | Operasi pemuatan, pemfilteran, penambahan, perubahan, dan penghapusan data dilakukan secara asinkron menggunakan **AJAX (`fetch`)** tanpa *reload* halaman penuh |
| `SRS-12` | Pengguna dapat menetapkan dan memperbarui batas anggaran pengeluaran bulanan (*Monthly Budget*) dengan validasi nominal > 0 |
| `SRS-13` | Pengguna dapat memantau progres penggunaan anggaran bulanan (total anggaran, terpakai, sisa, persentase *progress bar*, serta status *Aman* / *Hampir Habis* / *Melebihi Budget*) |
| `SRS-14` | Isolasi data anggaran bulanan — anggaran terikat secara spesifik pada `user_id` pengguna yang sedang login dan periode bulan (`YYYY-MM`) |

> **Catatan:** `SRS-06` (*session*) dan `SRS-07` (*cookie* preferensi) adalah dua mekanisme terpisah — *session cookie* (`duitku_session`) menjaga status autentikasi, sedangkan *cookie* preferensi (`duitku_balance_format`) menyimpan format tampilan nominal.

---

## Halaman & Endpoint API

### Halaman Antarmuka
| Halaman | Rute | Role | Requirement |
|---|---|---|---|
| Login | `/login` | Guest | `SRS-02` |
| Register | `/register` | Guest | `SRS-01` |
| Dashboard Utama | `/dashboard` (dan `/`) | User | `SRS-03` s.d. `SRS-14` |

### Endpoint REST API (AJAX)
| Endpoint | Method | Deskripsi | Requirement |
|---|---|---|---|
| `/api/auth/register` | `POST` | Registrasi pengguna baru | `SRS-01` |
| `/api/auth/login` | `POST` | Autentikasi & pembuatan *session cookie* | `SRS-02`, `SRS-06` |
| `/api/auth/logout` | `POST` | Menghapus sesi login pengguna | `SRS-06` |
| `/api/auth/me` | `GET` | Mengambil profil pengguna dari sesi aktif | `SRS-05`, `SRS-06` |
| `/api/transactions` | `GET`, `POST` | Mengambil transaksi terfilter (`userId`, `month`, `type`, `category`) & menambah transaksi via AJAX | `SRS-03`, `SRS-05`, `SRS-08`, `SRS-11` |
| `/api/transactions/[id]` | `GET`, `PUT`, `DELETE` | Mengambil detail, memperbarui, & menghapus transaksi via AJAX | `SRS-05`, `SRS-09`, `SRS-10`, `SRS-11` |
| `/api/budgets` | `GET`, `POST` | Mengambil & menyimpan (*create/update*) anggaran bulanan via AJAX | `SRS-11`, `SRS-12`, `SRS-14` |

---

## Role & Tim

| Role | Nama Anggota | Tanggung Jawab & Cakupan SRS |
|---|---|---|
| **Project Manager (PM)** | **Saburo Rafqi Hidayat** | Memecah SRS, membagi tugas, inisialisasi repo & koneksi DB Neon, mengatur *Git workflow*, menyelesaikan *merge conflict*, dan integrasi ke `main` |
| **Developer 1** | **Raffie Aditya Akbar** | Autentikasi, Session, & REST API Transaksi/Filter AJAX (`SRS-01`, `SRS-02`, `SRS-06`, `SRS-11`) |
| **Developer 2** | **Shalom Kurniawan** | Ringkasan Keuangan, Tabel Riwayat Transaksi, Cookie Preferensi Format Saldo, & Kartu Monitoring Anggaran Bulanan (`SRS-03`, `SRS-04`, `SRS-05`, `SRS-07`, `SRS-13`, `SRS-14`) |
| **Developer 3** | **Reynaldi Bertinus Hutagaol** | Modal Form Tambah/Edit Transaksi, Modal Konfirmasi Hapus, Modal Atur Anggaran Bulanan, & Endpoint `/api/budgets` (`SRS-08`, `SRS-09`, `SRS-10`, `SRS-11`, `SRS-12`, `SRS-14`) |

---

## Struktur Proyek & Branch

```text
ppk-project-3/
├── app/
│   ├── actions/transactions.ts         # Server actions & auto-init tabel PostgreSQL
│   ├── api/
│   │   ├── auth/                       # Endpoint login, register, logout, me (SRS-01, 02, 06)
│   │   ├── budgets/route.ts            # Endpoint AJAX GET & POST budget bulanan (SRS-11, 12, 14)
│   │   └── transactions/               # Endpoint AJAX GET, POST, PUT, DELETE transaksi (SRS-08..11)
│   ├── dashboard/page.tsx              # Halaman Dashboard Terpadu (SRS-03..14)
│   ├── login/page.tsx                  # Halaman Login (SRS-02)
│   └── register/page.tsx               # Halaman Register (SRS-01)
├── components/
│   ├── budget/
│   │   ├── BudgetModal.tsx             # Modal Atur/Ubah Anggaran Bulanan (SRS-12)
│   │   └── BudgetMonitorCard.tsx       # Kartu Progres & Status Anggaran Bulanan (SRS-13, 14)
│   ├── dashboard/
│   │   ├── SummaryCards.tsx            # Kartu Saldo, Pemasukan, Pengeluaran & Cookie (SRS-04, 07)
│   │   ├── TransactionFilter.tsx       # Filter Bulan, Tipe, & Kategori via AJAX (SRS-11)
│   │   └── TransactionTable.tsx        # Tabel Riwayat Transaksi + Aksi Edit/Hapus (SRS-03)
│   └── transactions/
│       ├── AddTransactionButton.tsx    # Tombol Trigger Modal Tambah Transaksi (SRS-08)
│       ├── DeleteConfirmModal.tsx      # Modal Konfirmasi Hapus Transaksi (SRS-10)
│       └── TransactionModal.tsx        # Modal Form Tambah & Edit Transaksi (SRS-08, 09)
├── lib/
│   ├── auth.ts & session.ts            # Utilitas session & autentikasi (SRS-06)
│   ├── budget-utils.ts                 # Kalkulasi pemakaian & status anggaran (SRS-13, 14)
│   ├── cookie-preference.ts            # Pengelolaan cookie format Rupiah (SRS-07)
│   ├── db.ts                           # Koneksi Neon PostgreSQL serverless
│   └── dummy-data.ts                   # Kontrak data uji tim (User u1..u3, Transaksi t1..t7, Budget b1..b2)
├── scripts/
│   ├── test-db.mjs                     # Uji koneksi database Neon PostgreSQL
│   ├── test-dev3.mjs                   # Uji otomatis logika transaksi (SRS-05, 08, 09, 10)
│   ├── test-budget.mjs                 # Uji otomatis kalkulasi & status budget (SRS-13, 14)
│   └── test-dev3-budget.mjs            # Uji otomatis validasi & CRUD budget (SRS-11, 12, 14)
└── types/
    ├── budget.ts                       # Definisi tipe data MonthlyBudget
    └── transaction.ts                  # Definisi tipe data Transaction
```

### Riwayat Integrasi Branch Fitur
```text
main
├── feature/auth               (Autentikasi, Register, Login, Middleware Session)
├── feature/developer-2        (Dashboard Summary, Tabel Transaksi, Cookie Preferensi)
├── feature/budget-api-modal   (API Budget, BudgetModal, AJAX TransactionModal)
├── feat/budget-monitoring     (BudgetMonitorCard & Kalkulasi Status Anggaran)
└── feature/API-Transaksi      (REST API Transaksi & Komponen TransactionFilter AJAX)
```

---

## Cara Menjalankan Project & Pengujian

### 1. Instalasi & Konfigurasi Environment
```bash
# Clone repository
git clone https://github.com/KrauXO/ppk-project-3.git
cd ppk-project-3

# Install dependencies
npm install
```

Pastikan berkas `.env.local` tersedia di root proyek dan berisi variabel berikut:
```env
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require"
SESSION_SECRET="rahasia-session-duitku"
```
*(Catatan: Jika `DATABASE_URL` belum dikonfigurasi atau sedang offline, aplikasi secara otomatis menggunakan fallback penyimpanan in-memory dari kontrak `lib/dummy-data.ts` sehingga tetap dapat diuji penuh tanpa kendala).*

### 2. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

### 3. Menjalankan Pengujian Otomatis
```bash
# Uji koneksi database PostgreSQL (Neon)
npm run test:db

# Uji logika transaksi & isolasi data (SRS-05, SRS-08, SRS-09, SRS-10)
node scripts/test-dev3.mjs

# Uji kalkulasi & indikator progres anggaran bulanan (SRS-13, SRS-14)
node scripts/test-budget.mjs

# Uji validasi & penyimpanan anggaran bulanan via AJAX (SRS-11, SRS-12, SRS-14)
node scripts/test-dev3-budget.mjs
```
