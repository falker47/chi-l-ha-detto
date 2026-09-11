import { readFile } from 'node:fs/promises';
import { getDatabase } from '../backend/database.js';

try {
  const sql = await readFile(new URL('../migrations/001_leaderboard.sql', import.meta.url), 'utf8');
  // This migration intentionally contains only two simple DDL statements.
  const statements = sql.split(';').map(text => text.trim()).filter(Boolean).map(text => ({ text }));
  await getDatabase().transaction(statements);
  console.log('Neon schema applied successfully (idempotent).');
} catch {
  console.error('Migration failed. Check server-only DATABASE_URL, connectivity and schema; no credentials logged.');
  process.exitCode = 1;
}
