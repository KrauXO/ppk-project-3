import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      <Navbar user={user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0F172A]">
            Selamat Datang, {user?.name || 'Mahasiswa'}!
          </h1>
          <p className="text-sm text-[#64748B]">
            Kelola pengeluaran dan pemasukan keuangan Anda dengan mudah di DUITku.
          </p>
        </div>

        {/* 
          Container Dashboard:
          - Developer 2: Summary bar (saldo, total income, total expense), Table riwayat transaksi, Cookie preferensi.
          - Developer 3: Modal form transaksi (tambah & edit).
        */}
        <div className="bg-white border border-[#E2E8F0] p-6 text-center text-sm text-[#64748B] rounded-[6px]">
          <p className="font-medium text-[#0F172A] mb-1">
            Area Dashboard Transaksi
          </p>
          <p>
            Fondasi autentikasi & session telah aktif. Area ini siap diisi oleh Developer 2 (Ringkasan & Riwayat) dan Developer 3 (Form Tambah & Edit).
          </p>
        </div>
      </main>
    </div>
  );
}
