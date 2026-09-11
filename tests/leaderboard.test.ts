import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../api/leaderboard.js';
import type { Database } from '../backend/database.js';
import { saveRecord, topQuery } from '../backend/leaderboard.js';
import { submissionSchema, maximumScore } from '../backend/validation.js';
import { importRows, normalizeTimestamp, prepareImport } from '../scripts/leaderboard-import.js';
import { themes, modes, leaderboardKey, emptyLeaderboard, localUpsert, type LeaderboardEntry } from '../shared/leaderboard.js';
import { leaderboardApi, LeaderboardApiError, readCache, writeCache } from '../src/lib/leaderboard.js';

const base = { mode: 'achille', theme: 'classica', name: 'Ada', streak: 3, score: 200 } as const;
const request = (body: unknown, method = 'POST') => new Request('http://localhost/api/leaderboard', {
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('server validation rejects malformed, impossible and privileged fields', () => {
  for (const change of [
    { name: '' }, { name: '  ' }, { name: 'x'.repeat(21) }, { name: 'a\0b' },
    { mode: 'classic' }, { theme: 'unknown' }, { score: NaN }, { score: Infinity },
    { streak: 1.1 }, { score: 1.1 }, { streak: -1 }, { score: -1 }, { score: '200' },
    { score: 2147483648 }, { streak: 2147483648 }, { score: 999999 },
    { timestamp: '2000-01-01' }, { id: 1 }, { mode: 'eracle', streak: 13 },
    { mode: 'eracle', theme: 'mista', streak: 16 }, { streak: 0, score: 1 },
  ]) assert.equal(submissionSchema.safeParse({ ...base, ...change }).success, false, JSON.stringify(change));
  assert.equal(submissionSchema.parse({ ...base, name: ' Ada ' }).name, 'Ada');
  assert.equal(submissionSchema.safeParse({ ...base, streak: 0, score: 0 }).success, true);
  for (const theme of themes) for (const mode of modes) {
    const streak = mode === 'achille' ? 50 : theme === 'mista' ? 15 : 12;
    const score = maximumScore(mode, theme, streak);
    assert.equal(submissionSchema.safeParse({ ...base, mode, theme, streak, score }).success, true);
    assert.equal(submissionSchema.safeParse({ ...base, mode, theme, streak, score: score + 1 }).success, false);
  }
});

test('real PostgreSQL schema, ranking, upsert, API and import', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  const migration = await readFile(new URL('../migrations/001_leaderboard.sql', import.meta.url), 'utf8');
  const db: Database = {
    query: async s => (await pg.query(s.text, s.values)).rows,
    transaction: statements => pg.transaction(async tx => {
      const results: any[][] = [];
      for (const s of statements) results.push((await tx.query(s.text, s.values)).rows);
      return results;
    }),
  };
  const ddl = migration.split(';').map(text => text.trim()).filter(Boolean).map(text => ({ text }));
  await db.transaction(ddl);
  await db.transaction(ddl); // Same execution path as npm run db:migrate.
  const handler = createHandler(() => db);

  await t.test('all eight combinations: rank by streak, score, timestamp; return five only', async () => {
    for (const theme of themes) for (const mode of modes) {
      const stats = [[5, 250], [5, 300], [5, 300], [6, 100], [4, 200], [3, 200], [2, 100]];
      await importRows(db, stats.map(([streak, score], i) => ({
        mode, theme, name: `Rank${i}`, streak, score, timestamp: `2025-01-0${i + 1}T00:00:00.000000Z`,
      })));
      const response = await handler(new Request(`http://localhost/api/leaderboard?theme=${theme}&mode=${mode}`));
      assert.equal(response.status, 200);
      const { data } = await response.json();
      const rows = data[leaderboardKey(theme, mode)];
      assert.deepEqual(rows.map((r: any) => r.name), ['Rank3', 'Rank1', 'Rank2', 'Rank0', 'Rank4']);
      assert.equal(Object.values(data).flat().length, 5);
    }
    const { data } = await (await handler(new Request('http://localhost/api/leaderboard?theme=mista'))).json();
    assert.equal(Object.values(data).flat().length, 10);
  });

  await t.test('API preserves microsecond ranking timestamps through JSON serialization', async () => {
    await importRows(db, [
      { ...base, mode: 'eracle', theme: 'mista', name: 'MicroLater', streak: 15, score: 9000, timestamp: '2025-01-01T00:00:00.000002Z' },
      { ...base, mode: 'eracle', theme: 'mista', name: 'MicroEarlier', streak: 15, score: 9000, timestamp: '2025-01-01T00:00:00.000001Z' },
    ]);
    const response = await handler(new Request('http://localhost/api/leaderboard?theme=mista&mode=eracle'));
    const rows = (await response.json()).data.mista_eracle;
    assert.equal(rows[0].name, 'MicroEarlier');
    assert.equal(rows[0].timestamp, '2025-01-01T00:00:00.000001Z');
    assert.equal(rows[1].timestamp, '2025-01-01T00:00:00.000002Z');
  });

  await t.test('POST persists, then replaces a same-name result even when lower; keeps its ID', async () => {
    assert.equal((await handler(request(base))).status, 200);
    const [before] = await db.query({ text: 'SELECT * FROM leaderboard WHERE name = $1', values: ['Ada'] });
    const response = await handler(request({ ...base, streak: 1, score: 50 }));
    assert.equal(response.status, 200);
    const [after] = await db.query({ text: 'SELECT * FROM leaderboard WHERE name = $1', values: ['Ada'] });
    assert.equal(after.id, before.id);
    assert.equal(after.score, 50);
    assert.equal(after.streak, 1);
    assert.ok(new Date(after.timestamp) >= new Date(before.timestamp));
    assert.equal((await handler(request({ ...base, name: 'ada' }))).status, 200);
    assert.equal((await db.query({ text: 'SELECT * FROM leaderboard WHERE lower(name) = $1', values: ['ada'] })).length, 2);
  });

  await t.test('overlapping submissions leave one coherent row; returned Top 5 sees the write', async () => {
    await Promise.all(Array.from({ length: 15 }, (_, i) => saveRecord(db, { ...base, name: 'Concurrent', streak: i, score: i * 30 })));
    const rows = await db.query({ text: "SELECT * FROM leaderboard WHERE name = 'Concurrent'" });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].score, rows[0].streak * 30);
    const top = await saveRecord(db, { ...base, name: 'Winner', streak: 100, score: 1000 });
    assert.equal(top[0].name, 'Winner');
    assert.equal(top.length, 5);
  });

  await t.test('database constraints reject invalid values and a failed transaction rolls back', async () => {
    await assert.rejects(db.query({ text: "INSERT INTO leaderboard(mode,theme,name,streak,score) VALUES ('bad','classica','X',1,1)" }));
    await assert.rejects(db.query({ text: "INSERT INTO leaderboard(mode,theme,name,streak,score) VALUES ('achille','classica','X',-1,1)" }));
    await assert.rejects(db.transaction([
      { text: "INSERT INTO leaderboard(mode,theme,name,streak,score) VALUES ('achille','classica','Rollback',1,1)" },
      { text: 'SELECT nonexistent_column FROM leaderboard' },
    ]));
    assert.equal((await db.query({ text: "SELECT * FROM leaderboard WHERE name='Rollback'" })).length, 0);
  });

  await t.test('import is deterministic, repeatable and preserves timestamps and newer target rows', async () => {
    const source = [
      { ...base, name: 'Legacy', streak: 50, score: 9999, timestamp: '2024-01-01 12:00:00.123456' },
      { ...base, name: 'Legacy', streak: 1, score: 20, timestamp: '2024-01-02 12:00:00.123456' },
      { ...base, name: 'Legacy', streak: 2, score: 20, timestamp: '2024-01-02 12:00:00.123456' },
    ];
    const prepared = prepareImport(source);
    assert.equal(prepared.duplicates, 2);
    assert.deepEqual(prepared, prepareImport([...source].reverse()));
    assert.equal(await importRows(db, prepared.rows), 1);
    assert.equal(await importRows(db, prepared.rows), 0);
    const [row] = await db.query({ text: "SELECT streak, timestamp::text AS timestamp FROM leaderboard WHERE name='Legacy'" });
    assert.equal(row.streak, 2);
    assert.ok(row.timestamp.includes('.123456'));
    await saveRecord(db, { ...base, name: 'Legacy', streak: 1, score: 50 });
    assert.equal(await importRows(db, prepared.rows), 0);
    assert.equal((await db.query({ text: "SELECT score FROM leaderboard WHERE name='Legacy'" }))[0].score, 50);
    assert.throws(() => prepareImport([...source, { ...base, timestamp: null }]));
    assert.throws(() => prepareImport([{ ...base, theme: null, timestamp: source[0].timestamp }]));
    assert.throws(() => normalizeTimestamp('2024-02-30T12:00:00Z'));
    assert.equal(normalizeTimestamp('2024-01-01T12:00:00.123456+02:00'), '2024-01-01T10:00:00.123456Z');
  });
});

test('provisioned Frankfurt schema: bigint IDs, historical duplicates, no UNIQUE or runtime DDL', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await pg.exec(`CREATE TABLE leaderboard (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name text NOT NULL, mode text NOT NULL, theme varchar NOT NULL DEFAULT 'classica',
    streak integer NOT NULL, score integer NOT NULL, timestamp timestamptz NOT NULL DEFAULT now()
  );
  INSERT INTO leaderboard (id, name, mode, streak, score, timestamp) VALUES
    (9007199254740993, 'Duplicate', 'achille', 20, 1000, '2025-01-01'),
    (9007199254740994, 'Duplicate', 'achille', 3, 200, '2025-01-02');
  CREATE ROLE app_runtime;
  GRANT USAGE ON SCHEMA public TO app_runtime;
  GRANT SELECT, INSERT, UPDATE ON leaderboard TO app_runtime;
  GRANT USAGE, SELECT ON SEQUENCE leaderboard_id_seq TO app_runtime;
  SET ROLE app_runtime;`);
  const db: Database = {
    query: async s => (await pg.query(s.text, s.values)).rows,
    transaction: statements => pg.transaction(async tx => {
      const results: any[][] = [];
      for (const s of statements) results.push((await tx.query(s.text, s.values)).rows);
      return results;
    }),
  };
  const before = await db.query(topQuery('classica', 'achille'));
  assert.equal(before.length, 1);
  assert.equal(before[0].id, '9007199254740994');
  assert.equal(before[0].score, 200);
  const after = await saveRecord(db, { ...base, name: 'Duplicate', streak: 1, score: 30 });
  assert.equal(after[0].id, before[0].id);
  assert.equal(after[0].score, 30);
  const history = await db.query({ text: 'SELECT id::text AS id, score FROM leaderboard ORDER BY id' });
  assert.deepEqual(history, [{ id: '9007199254740993', score: 1000 }, { id: '9007199254740994', score: 30 }]);
  await Promise.all(Array.from({ length: 5 }, (_, i) => saveRecord(db, { ...base, name: 'New', score: i })));
  assert.equal((await db.query({ text: "SELECT * FROM leaderboard WHERE name = 'New'" })).length, 1);
  await assert.rejects(db.query({ text: "DELETE FROM leaderboard WHERE name = 'New'" }));
  await assert.rejects(db.query({ text: 'ALTER TABLE leaderboard ADD COLUMN forbidden text' }));
});

test('API handles errors without leaking credentials; retries only reads', async () => {
  let queries = 0, writes = 0;
  const badDb: Database = {
    query: async () => { queries++; throw Error('postgresql://secret'); },
    transaction: async () => { writes++; throw Error('postgresql://secret'); },
  };
  const handler = createHandler(() => badDb);
  for (const query of ['', '?theme=bad', '?theme=mista&mode=bad', '?theme=mista&theme=trash', '?theme=mista&limit=100']) {
    assert.equal((await handler(new Request('http://localhost/api/leaderboard' + query))).status, 400);
  }
  assert.equal((await handler(new Request('http://localhost', { method: 'DELETE' }))).status, 405);
  assert.equal((await handler(new Request('http://localhost', { method: 'POST', body: '{}' }))).status, 415);
  assert.equal((await handler(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await handler(request({ ...base, name: 'a'.repeat(2000) }))).status, 400);
  assert.equal((await handler(request({ ...base, score: -1 }))).status, 400);
  assert.equal(queries + writes, 0);
  const response = await handler(new Request('http://localhost/api/leaderboard?theme=mista'));
  assert.equal(response.status, 503);
  assert.equal(queries, 2);
  assert.ok(!(await response.text()).includes('secret'));
  assert.equal((await handler(request(base))).status, 503);
  assert.equal(writes, 1);
  const missingEnv = createHandler(() => { throw Error('missing env'); });
  assert.equal((await missingEnv(request(base))).status, 503);
  let attempt = 0;
  const cold = createHandler(() => ({ ...badDb, query: async () => { if (!attempt++) throw Error('waking'); return []; } }));
  assert.equal((await cold(new Request('http://localhost/api/leaderboard?theme=classica'))).status, 200);
});

test('frontend cache, same-name fallback, unavailable storage and API error status', async t => {
  let saved = '';
  t.mock.method(globalThis, 'fetch', async (_url: RequestInfo | URL, init?: RequestInit) => {
    assert.ok(init?.signal);
    return Response.json({ error: 'invalid' }, { status: 400 });
  });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => saved,
    setItem: (_key: string, value: string) => { saved = value; },
  } });
  t.after(() => { delete (globalThis as any).localStorage; });
  const first: LeaderboardEntry = { ...base, id: '9007199254740993', timestamp: '2024-01-01T00:00:00Z' };
  const replaced = localUpsert([first], { ...first, id: 2, score: 50, streak: 1 });
  assert.equal(replaced.length, 1);
  assert.equal(replaced[0].score, 50);
  const data = { ...emptyLeaderboard(), achille: replaced };
  const microsecondRows = localUpsert([
    { ...first, name: 'Later', id: 1, timestamp: '2024-01-01T00:00:00.000002Z' },
  ], { ...first, name: 'Earlier', id: 2, timestamp: '2024-01-01T00:00:00.000001Z' });
  assert.equal(microsecondRows[0].name, 'Earlier');
  assert.equal(writeCache(data), true);
  assert.deepEqual(readCache(), data);
  saved = JSON.stringify({ achille: [first], eracle: 'broken' });
  assert.equal(readCache().achille.length, 1);
  assert.equal(readCache().eracle.length, 0);
  saved = '{';
  assert.deepEqual(readCache(), emptyLeaderboard());
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('blocked'); } });
  assert.equal(writeCache(data), false);
  assert.deepEqual(readCache(), emptyLeaderboard());
  await assert.rejects(leaderboardApi.addRecord('achille', 'classica', 'Ada', 1, 50),
    error => error instanceof LeaderboardApiError && error.status === 400);
});
