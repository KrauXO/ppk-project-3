import { sql } from './db';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

// Contract dummy users as specified in PRD Section 11
export const DUMMY_USERS: User[] = [
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

// Fallback in-memory users storage when DB is unreachable or unconfigured
const memoryUsers: Map<string, User> = new Map(
  DUMMY_USERS.map((u) => [u.email.toLowerCase(), { ...u }])
);

let dbInitialized = false;

/**
 * Initialize table in Neon Postgres if connected and seed dummy data if empty
 */
async function ensureDbInitialized(): Promise<boolean> {
  if (dbInitialized) return true;

  try {
    // Check if Neon connection string is not the default placeholder
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || dbUrl.includes('user:password@host/dbname')) {
      return false;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Check if seeded
    const existing = await sql`SELECT COUNT(*)::int as count FROM users;`;
    if (existing[0]?.count === 0) {
      for (const u of DUMMY_USERS) {
        await sql`
          INSERT INTO users (id, name, email, password, created_at)
          VALUES (${u.id}, ${u.name}, ${u.email}, ${u.password}, ${u.created_at})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    dbInitialized = true;
    return true;
  } catch (error) {
    console.warn('PostgreSQL Neon not reachable or initialized, using in-memory dummy contract fallback:', error);
    return false;
  }
}

/**
 * Find user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      const rows = await sql`
        SELECT id, name, email, password, created_at
        FROM users
        WHERE LOWER(email) = ${normalizedEmail}
        LIMIT 1;
      `;
      if (rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch {
      // Fallback
    }
  }

  const user = memoryUsers.get(normalizedEmail);
  return user ? { ...user } : null;
}

/**
 * Find user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      const rows = await sql`
        SELECT id, name, email, password, created_at
        FROM users
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch {
      // Fallback
    }
  }

  for (const user of memoryUsers.values()) {
    if (user.id === id) return { ...user };
  }
  return null;
}

/**
 * Create a new user (SRS-01)
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const newId = `u_${Date.now()}`;
  const now = new Date().toISOString();

  const newUser: User = {
    id: newId,
    name: data.name.trim(),
    email: normalizedEmail,
    password: data.password,
    created_at: now,
  };

  const isDbReady = await ensureDbInitialized();
  if (isDbReady) {
    try {
      await sql`
        INSERT INTO users (id, name, email, password, created_at)
        VALUES (${newUser.id}, ${newUser.name}, ${newUser.email}, ${newUser.password}, ${newUser.created_at});
      `;
      return newUser;
    } catch {
      // If DB insert fails, fallback to memory
    }
  }

  memoryUsers.set(normalizedEmail, newUser);
  return newUser;
}
