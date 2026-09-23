import { neon } from '@neondatabase/serverless';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Read .env.local
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
    const match = envFile.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) databaseUrl = match[1];
  } catch {
    // ignore
  }
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const dummyUsers = [
  {
    id: 'u1',
    name: 'Alya Putri',
    email: 'alya@studentmail.id',
    password: 'password123',
    created_at: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Bima Saputra',
    email: 'bima@studentmail.id',
    password: 'password123',
    created_at: '2025-01-12T00:00:00.000Z',
  },
  {
    id: 'u3',
    name: 'Citra Dewi',
    email: 'citra@studentmail.id',
    password: 'password123',
    created_at: '2025-01-15T00:00:00.000Z',
  },
];

async function seed() {
  console.log('🌱 Menghubungkan ke Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  try {
    console.log('📦 Membuat tabel users (jika belum ada)...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('👥 Memasukkan dummy user kontrak (PRD Bagian 11)...');
    for (const u of dummyUsers) {
      await sql`
        INSERT INTO users (id, name, email, password, created_at)
        VALUES (${u.id}, ${u.name}, ${u.email}, ${u.password}, ${u.created_at})
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password;
      `;
    }

    const rows = await sql`SELECT id, name, email, created_at FROM users ORDER BY id ASC;`;
    console.log('✅ Seeding berhasil! Data tabel users saat ini:');
    console.table(rows);
  } catch (error) {
    console.error('❌ Gagal melakukan seeding:', error);
  }
}

seed();
