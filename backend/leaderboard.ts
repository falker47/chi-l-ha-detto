import type { Database, Statement } from './database.js';
import type { LeaderboardEntry, Mode, Theme } from '../shared/leaderboard.js';
import { emptyLeaderboard, leaderboardKey } from '../shared/leaderboard.js';

export function topQuery(theme: Theme, mode?: Mode): Statement {
  return {
    // Return timestamp as UTC text so the driver's Date parser cannot truncate
    // PostgreSQL microseconds before the browser stores/re-sorts its cache.
    text: `SELECT ranked.id::text AS id, ranked.mode, ranked.theme, ranked.name, ranked.streak, ranked.score,
        to_char(ranked.timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS timestamp
      FROM unnest($2::text[]) AS modes(mode)
      CROSS JOIN LATERAL (
        SELECT id, mode, theme, name, streak, score, timestamp
        FROM (
          SELECT DISTINCT ON (name) id, mode, theme, name, streak, score, timestamp
          FROM public.leaderboard WHERE theme = $1 AND mode = modes.mode
          ORDER BY name, timestamp DESC, streak DESC, score DESC, id DESC
        ) AS latest
        ORDER BY streak DESC, score DESC, timestamp ASC, id ASC LIMIT 5
      ) AS ranked
      ORDER BY ranked.mode, ranked.streak DESC, ranked.score DESC, ranked.timestamp ASC, ranked.id ASC`,
    values: [theme, mode ? [mode] : ['achille', 'eracle']],
  };
}

export function upsertQueries(row: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Statement[] {
  const values = [row.mode, row.theme, row.name, row.streak, row.score];
  return [
    // Separate statement: after waiting for the lock, READ COMMITTED gives the
    // following write a fresh snapshot. No UNIQUE constraint or runtime DDL needed.
    { text: `SELECT pg_advisory_xact_lock(hashtextextended(json_build_array($1::text, $2::text, $3::text)::text, 0))`,
      values: values.slice(0, 3) },
    { text: `WITH existing AS (
        SELECT id FROM public.leaderboard WHERE mode = $1 AND theme = $2 AND name = $3
        ORDER BY timestamp DESC, streak DESC, score DESC, id DESC LIMIT 1
      ), updated AS (
        UPDATE public.leaderboard SET streak = $4, score = $5, timestamp = clock_timestamp()
        WHERE id IN (SELECT id FROM existing) RETURNING id
      )
      INSERT INTO public.leaderboard (mode, theme, name, streak, score)
      SELECT $1, $2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM updated)
      RETURNING id`, values },
  ];
}

export function groupRows(rows: LeaderboardEntry[]) {
  const data = emptyLeaderboard();
  for (const row of rows) data[leaderboardKey(row.theme, row.mode)].push(row);
  return data;
}

export async function saveRecord(db: Database, row: Omit<LeaderboardEntry, 'id' | 'timestamp'>) {
  // A single transaction ensures the returned Top 5 includes our write.
  const [, , top] = await db.transaction([...upsertQueries(row), topQuery(row.theme, row.mode)]);
  return top;
}
