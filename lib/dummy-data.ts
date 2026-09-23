import { Transaction, User } from '@/types/transaction';

/**
 * Sumber Dummy Data sesuai Bagian 11 Dummy Data Contract (PDF DUITku)
 * Dipakai oleh seluruh developer untuk memastikan konsistensi pengujian.
 */

export const DUMMY_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alya Putri',
    email: 'alya@studentmail.id',
    password: 'password123',
    created_at: '2025-01-10',
  },
  {
    id: 'u2',
    name: 'Bima Saputra',
    email: 'bima@studentmail.id',
    password: 'password123',
    created_at: '2025-01-12',
  },
  {
    id: 'u3',
    name: 'Citra Dewi',
    email: 'citra@studentmail.id',
    password: 'password123',
    created_at: '2025-01-15',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    user_id: 'u1',
    type: 'income',
    category: 'Uang Saku',
    amount: 2000000,
    description: 'Uang saku bulanan dari orang tua',
    date: '2025-02-01',
    created_at: '2025-02-01T08:00:00Z',
  },
  {
    id: 't2',
    user_id: 'u1',
    type: 'expense',
    category: 'Makan',
    amount: 25000,
    description: 'Makan siang di kantin',
    date: '2025-02-01',
    created_at: '2025-02-01T12:30:00Z',
  },
  {
    id: 't3',
    user_id: 'u1',
    type: 'expense',
    category: 'Transport',
    amount: 15000,
    description: 'Ojek online ke kampus',
    date: '2025-02-02',
    created_at: '2025-02-02T07:45:00Z',
  },
  {
    id: 't4',
    user_id: 'u1',
    type: 'expense',
    category: 'Lainnya',
    amount: 150000,
    description:
      'Beli buku referensi mata kuliah Pemrograman Berbasis Web edisi internasional yang harganya lumayan mahal',
    date: '2025-02-03',
    created_at: '2025-02-03T15:20:00Z',
  },
  {
    id: 't5',
    user_id: 'u1',
    type: 'income',
    category: 'Beasiswa',
    amount: 12500000,
    description: 'Pencairan beasiswa semester genap',
    date: '2025-02-05',
    created_at: '2025-02-05T10:00:00Z',
  },
  {
    id: 't6',
    user_id: 'u2',
    type: 'expense',
    category: 'Makan',
    amount: 20000,
    description: 'Sarapan',
    date: '2025-02-01',
    created_at: '2025-02-01T07:10:00Z',
  },
  {
    id: 't7',
    user_id: 'u2',
    type: 'income',
    category: 'Freelance',
    amount: 500000,
    description: 'Bayaran desain poster acara kampus',
    date: '2025-02-04',
    created_at: '2025-02-04T16:00:00Z',
  },
];
