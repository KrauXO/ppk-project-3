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

---

## 2. Struktur Berkas & Komponen Modular

Untuk mencegah konflik saat *merging* ([CONFLICT RISK]), Developer 2 memecah seluruh fitur ke dalam komponen-komponen terisolasi:

```text
ppk-project-3/
├── lib/
│   ├── dummy-data.ts           # Kontrak data tim (User u1..u3, Transaksi t1..t7, formula ringkasan)
│   └── cookie-preference.ts    # Helper baca/tulis cookie preferensi format saldo Rupiah & formatter
├── components/
│   └── dashboard/
│       ├── SummaryCards.tsx    # 3 kartu ringkasan keuangan + UI switch preferensi cookie (SRS-04, SRS-07)
│       └── TransactionTable.tsx# Tabel riwayat transaksi + Empty State (SRS-03, SRS-05)
└── app/
    └── dashboard/
        └── page.tsx            # Container halaman dashboard modular
```

### Keterangan Komponen:
1. **`lib/dummy-data.ts`**:
   * Mengimplementasikan kontrak data resmi Bagian 11 dokumen tim.
   * Fungsi `getTransactionsByUserId(userId)` untuk isolasi data (SRS-05).
   * Fungsi `calculateFinancialSummary(transactions)` untuk menghitung Saldo = Pemasukan - Pengeluaran (SRS-04).
2. **`lib/cookie-preference.ts`**:
   * Mengatur cookie `duitku_balance_format` dengan nilai `with_symbol` ("Rp 14.310.000") atau `without_symbol` ("14.310.000").
   * Masa berlaku cookie 30 hari, path `/`, SameSite `Lax`.
3. **`components/dashboard/SummaryCards.tsx`**:
   * Menampilkan Saldo, Pemasukan (Badge Hijau `#16A34A`), Pengeluaran (Badge Merah `#DC2626`).
   * Dropdown preferensi format saldo langsung mengupdate cookie secara *real-time*.
4. **`components/dashboard/TransactionTable.tsx`**:
   * Desain clean tanpa efek berlebih (*Anti-AI UI*): Header abu `#F8FAFC`, border `#E2E8F0`, pill badge pemasukan/pengeluaran.
   * Penanganan deskripsi panjang (seperti data `t4`) secara rapi tanpa merusak tata letak tabel.
   * Penanganan **Empty State**: Ketika user tidak memiliki transaksi (seperti Citra `u3`), muncul pesan informatif *"Belum ada transaksi"*.
5. **`app/dashboard/page.tsx`**:
   * Menggabungkan komponen-komponen di atas.
   * Dilengkapi selector **"User Uji"** di header navbar untuk mempermudah PM/Asprak memverifikasi isolasi data secara langsung.
   * Dilengkapi slot kontainer `<div id="dev3-add-transaction-slot">` agar Developer 3 dapat langsung memasang tombol modal Tambah Transaksi tanpa bentrok.

---

## 3. Hasil Validasi Matematis & Data Uji (Baseline Dokumen PDF)

Perhitungan pada data uji pengguna `u1` (Alya Putri):
* **Pemasukan**:
  * `t1` (Uang Saku): Rp 2.000.000
  * `t5` (Beasiswa): Rp 12.500.000
  * **Total Pemasukan** = **Rp 14.500.000** (VALID)
* **Pengeluaran**:
  * `t2` (Makan): Rp 25.000
  * `t3` (Transport): Rp 15.000
  * `t4` (Buku): Rp 150.000
  * **Total Pengeluaran** = **Rp 190.000** (VALID)
* **Saldo Bersih**:
  * 14.500.000 - 190.000 = **Rp 14.310.000** (VALID, 100% cocok dengan acuan dokumen tim)

Perhitungan pada data uji pengguna `u2` (Bima Saputra):
* Total Pemasukan: Rp 500.000 (`t7`)
* Total Pengeluaran: Rp 20.000 (`t6`)
* Saldo: Rp 480.000 (VALID)

Perhitungan pada data uji pengguna `u3` (Citra Dewi):
* 0 Transaksi -> Saldo: Rp 0, Pemasukan: Rp 0, Pengeluaran: Rp 0.
* Menampilkan visual **Empty State** (VALID).

---

## 4. Panduan Pengujian Manual untuk PM / Lead Dev

Buka URL: `http://localhost:3000/dashboard`

1. **Uji Ringkasan (SRS-04)**:
   * Periksa 3 kartu di bagian atas. Pastikan angka Saldo (Rp 14.310.000), Pemasukan (Rp 14.500.000), dan Pengeluaran (Rp 190.000) tampil tepat.
2. **Uji Cookie Preferensi (SRS-07)**:
   * Pada baris "Preferensi Tampilan (SRS-07)", ubah dropdown dari *"Simbol Lengkap (Rp 14.310.000)"* ke *"Angka Saja (14.310.000)"*.
   * Perhatikan seluruh angka di kartu dan tabel seketika berganti format tanpa prefix "Rp".
   * Tekan `F5` / *Refresh* browser. Pastikan format tetap bertahan pada pilihan terakhir (terbaca dari cookie browser).
3. **Uji Isolasi Data (SRS-05) & Riwayat (SRS-03)**:
   * Pada bagian navbar atas, pilih dropdown User Uji:
     * Ubah ke **u2 - Bima**: Tabel dan kartu seketika menampilkan hanya transaksi milik Bima (Sarapan & Freelance, Saldo Rp 480.000).
     * Ubah ke **u3 - Citra**: Tabel menampilkan ilustrasi *Empty State* ("Belum ada transaksi") dan semua saldo bernilai Rp 0.

---

## 5. Catatan Integrasi untuk PM ([CONFLICT RISK] Zero Conflict)

1. **Integrasi dengan Developer 1 (Auth & Session)**:
   * Saat Dev 1 selesai membuat session login, PM cukup mengganti `activeUser` di `app/dashboard/page.tsx` dengan objek user dari sesi login nyata (misal via session hook / server props).
2. **Integrasi dengan Developer 3 (Modal Tambah Transaksi)**:
   * Developer 3 dapat langsung mengimpor komponen modal tambah transaksinya ke dalam container dashboard atau menggantikan elemen slot `#dev3-add-transaction-slot`.
   * Karena komponen tabel (`TransactionTable.tsx`) dan kartu (`SummaryCards.tsx`) menerima props murni (`transactions` & `summary`), mutasi data baru dari Dev 3 akan langsung tercermin secara reaktif.

---

*Disiapkan dengan penuh kedisiplinan kode oleh Developer 2.*
