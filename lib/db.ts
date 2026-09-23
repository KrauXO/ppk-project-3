import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set in .env.local');
}

/**
 * SQL tagged template helper for querying Neon PostgreSQL.
 * Example usage in Server Components or Server Actions:
 *   const data = await sql`SELECT * FROM users WHERE id = ${userId}`;
 */
export const sql = neon(databaseUrl);
