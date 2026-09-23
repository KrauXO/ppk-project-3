import { neon } from '@neondatabase/serverless';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Read .env.local manually if not loaded
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

async function testConnection() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as current_time, version() as pg_version;`;
    console.log('✅ Connection Successful!');
    console.log('Timestamp:', result[0].current_time);
    console.log('Postgres Version:', result[0].pg_version);
  } catch (error) {
    console.error('❌ Connection Failed:', error);
  }
}

testConnection();
