import { mkdir, writeFile } from 'node:fs/promises';

try {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_EXPORT_KEY;
  if (!base || !key) throw new Error('Missing source credentials');
  const url = new URL('/rest/v1/leaderboard', base);
  if (url.protocol !== 'https:') throw new Error('HTTPS required');
  url.searchParams.set('select', 'id,mode,theme,name,streak,score,timestamp');
  url.searchParams.set('order', 'id.asc');
  const rows: unknown[] = [];
  let total: number | undefined;
  while (true) {
    url.searchParams.set('offset', String(rows.length));
    url.searchParams.set('limit', '500');
    const response = await fetch(url, { headers: {
      apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact',
    }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Source unavailable');
    const count = response.headers.get('content-range')?.split('/')[1];
    if (!count || !/^\d+$/.test(count)) throw new Error('Cannot verify source row count');
    if (total !== undefined && total !== Number(count)) throw new Error('Source changed during export');
    total = Number(count);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('Invalid source');
    rows.push(...page);
    if (rows.length === total) break;
    if (!page.length || rows.length > total) throw new Error('Incomplete export');
  }
  await mkdir('backups', { recursive: true });
  const path = `backups/supabase-leaderboard-${Date.now()}.json`;
  await writeFile(path, JSON.stringify(rows, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(`Exported ${rows.length} visible rows to ${path}. Verify count against SQL Editor (RLS may hide rows).`);
} catch {
  console.error('Export failed: verify source availability and SELECT permission. Source was never modified; credentials not logged.');
  process.exitCode = 1;
}
