import { neon } from '@neondatabase/serverless';

export type Statement = { text: string; values?: unknown[] };
export interface Database {
  query(statement: Statement): Promise<any[]>;
  transaction(statements: Statement[]): Promise<any[][]>;
}

export function getDatabase(): Database {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required server-side');
  const target = new URL(process.env.DATABASE_URL);
  if (!target.hostname.endsWith('.eu-central-1.aws.neon.tech') ||
      target.pathname !== '/chi_l_ha_detto' || target.username !== 'chi_l_ha_detto_app') {
    throw new Error('Unexpected database target');
  }
  const sql = neon(process.env.DATABASE_URL);
  // A fresh signal for each operation, including after months of inactivity.
  const options = () => ({ fetchOptions: { signal: AbortSignal.timeout(12000) } });
  return {
    query: statement => sql.query(statement.text, statement.values ?? [], options()),
    transaction: statements => sql.transaction(
      statements.map(s => sql.query(s.text, s.values ?? [])), { ...options(), isolationLevel: 'ReadCommitted' }
    ),
  };
}
