import { historicalSchema } from '../backend/validation.js';
import type { Database, Statement } from '../backend/database.js';
import type { LeaderboardEntry } from '../shared/leaderboard.js';

type ImportedRow = Omit<LeaderboardEntry, 'id'>;
// PostgreSQL timestamps without a timezone in the old schema are treated as UTC.
export function normalizeTimestamp(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Missing timestamp');
  let input = value.trim().replace(' ', 'T');
  if (/T\d{2}:\d{2}:\d{2}(\.\d{1,6})?$/.test(input)) input += 'Z';
  input = input.replace(/([+-]\d{2})$/, '$1:00');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(input)) {
    throw new Error('Invalid timestamp');
  }
  const [year, month, day] = input.slice(0, 10).split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) throw new Error('Invalid timestamp');
  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid timestamp');
  const fraction = input.match(/\.(\d+)/)?.[1] ?? '';
  return date.toISOString().slice(0, 19) + '.' + fraction.padEnd(6, '0') + 'Z';
}

export function prepareImport(source: unknown) {
  if (!Array.isArray(source)) throw new Error('Export must be a JSON array of rows');
  const chosen = new Map<string, ImportedRow>();
  // Validate EVERY row before writes. Preserve names exactly (case-sensitive).
  source.forEach((raw, index) => {
    try {
      const row = { ...historicalSchema.parse(raw), timestamp: normalizeTimestamp(raw.timestamp) };
      const key = JSON.stringify([row.mode, row.theme, row.name]);
      const old = chosen.get(key);
      // Existing semantics are latest submission wins, NOT highest score wins.
      // Equal timestamp: higher streak, then score. Remaining equal rows are equivalent.
      if (!old || row.timestamp > old.timestamp || (row.timestamp === old.timestamp &&
        (row.streak > old.streak || (row.streak === old.streak && row.score > old.score)))) chosen.set(key, row);
    } catch { throw new Error(`Invalid source row ${index + 1}; nothing imported. Review the untouched backup.`); }
  });
  const rows = [...chosen.values()].sort((a, b) => JSON.stringify([a.mode, a.theme, a.name])
    .localeCompare(JSON.stringify([b.mode, b.theme, b.name]), 'en'));
  return { rows, sourceCount: source.length, duplicates: source.length - rows.length };
}

export function importQuery(row: ImportedRow): Statement {
  return {
    text: `INSERT INTO public.leaderboard (mode, theme, name, streak, score, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6::timestamptz)
      ON CONFLICT (mode, theme, name) DO UPDATE SET
        streak = EXCLUDED.streak, score = EXCLUDED.score, timestamp = EXCLUDED.timestamp
      WHERE leaderboard.timestamp < EXCLUDED.timestamp
      RETURNING id`,
    values: [row.mode, row.theme, row.name, row.streak, row.score, row.timestamp],
  };
}

export async function importRows(db: Database, rows: ImportedRow[]) {
  if (rows.length > 10000) throw new Error('Over 10000 unique rows: review migration batching before importing.');
  if (!rows.length) return 0;
  const results = await db.transaction(rows.map(importQuery));
  return results.reduce((n, result) => n + result.length, 0);
}
