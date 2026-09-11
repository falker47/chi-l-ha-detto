import { emptyLeaderboard, compareEntries, leaderboardKey, modes, themes } from '../../shared/leaderboard';
import type { LeaderboardData, LeaderboardEntry, Theme } from '../../shared/leaderboard';
export type { LeaderboardData, LeaderboardEntry } from '../../shared/leaderboard';
export { localUpsert } from '../../shared/leaderboard';

export class LeaderboardApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new LeaderboardApiError('Classifica online non disponibile', response.status);
  return (await response.json()).data;
}

export const leaderboardApi = {
  getAll: (theme: Theme): Promise<LeaderboardData> => request(`/api/leaderboard?theme=${encodeURIComponent(theme)}`),
  addRecord: (mode: string, theme: string, name: string, streak: number, score: number): Promise<LeaderboardEntry[]> =>
    request('/api/leaderboard', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, theme, name, streak, score }),
    }),
};

const CACHE_KEY = 'chiLHaDetto_leaderboard_backup';
export function readCache(): LeaderboardData {
  const data = emptyLeaderboard();
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
    for (const theme of themes) for (const mode of modes) {
      const key = leaderboardKey(theme, mode);
      if (!Array.isArray(raw?.[key])) continue;
      data[key] = raw[key].filter((row: LeaderboardEntry) => row &&
        typeof row.name === 'string' && row.name.trim() &&
        (typeof row.id === 'number' ? Number.isSafeInteger(row.id) && row.id >= 0 : typeof row.id === 'string' && /^\d+$/.test(row.id)) &&
        Number.isInteger(row.streak) && row.streak >= 0 && Number.isInteger(row.score) && row.score >= 0 &&
        Number.isFinite(Date.parse(row.timestamp)))
        .map((row: LeaderboardEntry) => ({ ...row, mode, theme }))
        .sort(compareEntries).slice(0, 5);
    }
  } catch { /* Storage may be corrupt or blocked; remote access must still work. */ }
  return data;
}

export function writeCache(data: LeaderboardData): boolean {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}
