import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import handler from '../api/leaderboard.js';

// Local adapter for the SAME handler deployed by Vercel. No local JSON database.
createServer(async (req, res) => {
  if (req.url?.split('?')[0] !== '/api/leaderboard') {
    res.writeHead(404).end(); return;
  }
  try {
    const init = {
      method: req.method,
      headers: req.headers as HeadersInit,
      ...(req.method !== 'GET' && req.method !== 'HEAD'
        ? { body: Readable.toWeb(req) as ReadableStream, duplex: 'half' } : {}),
    };
    const response = await handler.fetch(new Request(`http://localhost:3001${req.url}`, init));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' }).end('{"error":"API error"}');
  }
}).listen(3001, '127.0.0.1', () => console.log('Leaderboard API: http://127.0.0.1:3001'));
