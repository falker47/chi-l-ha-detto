import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { getDatabase } from '../backend/database.js';
import { importRows, prepareImport } from './leaderboard-import.js';

try {
  const args = process.argv.slice(2);
  const [file, operation = 'dry-run'] = args;
  if (!file || args.length > 2 || !['dry-run', '--dry-run', 'apply'].includes(operation)) {
    throw new Error('Usage: npm run db:import -- backups/source.json [dry-run|apply] (CSV also supported)');
  }
  const original = await readFile(file, 'utf8');
  // Preserve even invalid/duplicate rows for review, without overwriting any backup.
  await mkdir('backups', { recursive: true });
  const csv = file.toLowerCase().endsWith('.csv');
  const backup = `backups/import-source-${Date.now()}.${csv ? 'csv' : 'json'}`;
  await writeFile(backup, original, { flag: 'wx', mode: 0o600 });
  const source = csv ? parse(original, { columns: true, bom: true, skip_empty_lines: true,
    cast: (value, context) => !context.header && ['score', 'streak'].includes(String(context.column)) && /^\d+$/.test(value)
      ? Number(value) : value,
  }) : JSON.parse(original.replace(/^\uFEFF/, ''));
  const prepared = prepareImport(source);
  console.log(`Backup: ${backup}; source=${prepared.sourceCount}, unique=${prepared.rows.length}, duplicates=${prepared.duplicates}`);
  if (operation !== 'apply') console.log('Dry run: no database connection or writes.');
  else console.log(`Import committed: ${await importRows(getDatabase(), prepared.rows)} inserted/updated; remaining rows already present or newer.`);
} catch (error) {
  // Database/network error objects can contain secrets; never dump them.
  const safe = error instanceof Error && /^(Usage:|Invalid source row|Export must|Over 10000)/.test(error.message);
  console.error(safe ? error.message : 'Import failed. Review the input and server-only DATABASE_URL. No source data was changed.');
  process.exitCode = 1;
}
