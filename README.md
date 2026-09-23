# DUITku — Expense Tracker

Aplikasi web sederhana untuk membantu mahasiswa mencatat pemasukan, pengeluaran, dan memantau kondisi keuangan pribadinya. Pengguna dapat menambahkan, mengubah, menghapus, dan melihat transaksi keuangannya melalui dashboard.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [SRS (Software Requirement Specification)](#srs-software-requirement-specification)
- [Role & Tim](#role--tim)
- [Struktur Pembagian Developer](#struktur-pembagian-developer)
- [Cara Menjalankan Project](#cara-menjalankan-project)

---

## Tentang Project

**DUITku** memungkinkan pengguna (mahasiswa) untuk:
- Membuat akun & login
- Mencatat transaksi keuangan (pemasukan/pengeluaran)
- Melihat riwayat transaksi
- Memantau saldo, total pemasukan, dan total pengeluaran secara real-time

Scope dikerjakan **ketat sesuai SRS** — tidak ada fitur tambahan di luar requirement.

---

## SRS (Software Requirement Specification)

| Kode | Requirement |
|---|---|
| `SRS-01` | Pengguna dapat membuat akun |
| `SRS-02` | Pengguna dapat masuk (login) ke aplikasi |
| `SRS-03` | Pengguna dapat melihat transaksi & riwayat transaksi |
| `SRS-04` | Pengguna dapat mengetahui kondisi keuangan melalui saldo, total pemasukan, dan total pengeluaran |
| `SRS-05` | Data transaksi terhubung dengan pengguna yang login — setiap pengguna hanya dapat mengakses & mengelola data miliknya sendiri |
| `SRS-06` | Aplikasi mempertahankan informasi login pengguna selama session masih berlaku |
| `SRS-07` | Aplikasi menggunakan cookies untuk menyimpan minimal satu preferensi pengguna — **ditetapkan: format tampilan saldo (Rupiah)** |
| `SRS-08` | Pengguna dapat menambahkan transaksi keuangan |
| `SRS-09` | Pengguna dapat mengubah transaksi keuangan |
| `SRS-10` | Pengguna dapat menghapus transaksi keuangan |

> **Catatan:** `SRS-06` (session) dan `SRS-07` (cookie) adalah dua mekanisme berbeda — session menjaga status login, cookie hanya menyimpan 1 preferensi tampilan. Tidak digabung.

### Halaman

| Halaman | Role | Requirement |
|---|---|---|
| Login | Guest | `SRS-02` |
| Register | Guest | `SRS-01` |
| Dashboard | User | `SRS-03` `SRS-04` `SRS-05` `SRS-06` `SRS-07` `SRS-08` `SRS-09` `SRS-10` |

---

## Role & Tim

| Role | Tanggung Jawab |
|---|---|
| **Project Manager (PM) : Saburo Rafqi Hidayat** | Memecah SRS, membagi tugas, inisialisasi repo, atur workflow, handle merge conflict, integrasi ke `main` |
| **Developer 1 : Raffie Aditya Akbar** | Auth & Session — Register, Login, Logout, Session persistence (`SRS-01, 02, 06`) |
| **Developer 2 : Shalom Kurniawan** | Ringkasan, Riwayat, Hapus & Preferensi Tampilan — Summary saldo, list transaksi, cookie format saldo (`SRS-03, 04, 07`) |
| **Developer 3 : Reynaldi Bertinus Hutagaol** | Form Transaksi — Tambah, hapus transaksi & Edit transaksi (modal form yang sama) (`SRS-08, 09, 10`) |

Fondasi bersama (design system, shared component, session middleware, pola query `user_id` untuk data isolation) dikerjakan di awal sebelum ketiga developer masuk ke scope masing-masing.

---

## Struktur Pembagian Developer

```
main
├── feature/developer-1   (auth, session)
├── feature/developer-2   (dashboard summary, list, cookie preferensi)
└── feature/developer-3   (form tambah, hapus & edit transaksi)
```

---

## Cara Menjalankan Project

```bash
# Clone repo
git clone <repo-url>
cd duitku

# Install dependency
npm install

# Jalankan project
npm run dev
```
