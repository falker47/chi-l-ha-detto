import { getDatabase, type Database } from '../backend/database.js';
import { groupRows, saveRecord, topQuery } from '../backend/leaderboard.js';
import { scopeSchema, submissionSchema } from '../backend/validation.js';

const reply = (status: number, body: unknown, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
});

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 1024) { await reader.cancel(); throw new Error('Body too large'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createHandler(database: () => Database = getDatabase) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'GET' && request.method !== 'POST') {
      return reply(405, { error: 'Metodo non consentito' }, { Allow: 'GET, POST' });
    }
    if (request.method === 'GET') {
      const params = new URL(request.url).searchParams;
      const parsed = scopeSchema.safeParse(Object.fromEntries(params));
      if (!parsed.success || [...params.keys()].some(k => params.getAll(k).length > 1)) {
        return reply(400, { error: 'Tema o modalità non validi' });
      }
      try {
        const db = database();
        // Retry reads once for transient errors during a cold wake-up. Never replay writes.
        let rows;
        try { rows = await db.query(topQuery(parsed.data.theme, parsed.data.mode)); }
        catch { rows = await db.query(topQuery(parsed.data.theme, parsed.data.mode)); }
        return reply(200, { data: groupRows(rows) });
      } catch {
        return reply(503, { error: 'Classifica online temporaneamente non disponibile' });
      }
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return reply(415, { error: 'Richiesto application/json' });
    }
    let body;
    try { body = await readBody(request); }
    catch { return reply(400, { error: 'JSON non valido o troppo grande' }); }
    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) return reply(400, { error: 'Record non valido' });
    try {
      return reply(200, { data: await saveRecord(database(), parsed.data) });
    } catch {
      return reply(503, { error: 'Classifica online temporaneamente non disponibile' });
    }
  };
}

export default { fetch: createHandler() };
