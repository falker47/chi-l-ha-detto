export const themes = ['classica', 'intrattenimento', 'trash', 'mista'] as const;
export const modes = ['achille', 'eracle'] as const;
export type Theme = typeof themes[number];
export type Mode = typeof modes[number];
export interface LeaderboardEntry {
  id: number | string;
  mode: Mode;
  theme: Theme;
  name: string;
  streak: number;
  score: number;
  timestamp: string;
}
export type LeaderboardKey = Mode | `${Exclude<Theme, 'classica'>}_${Mode}`;
export type LeaderboardData = Record<LeaderboardKey, LeaderboardEntry[]>;
export const leaderboardKey = (theme: Theme, mode: Mode): LeaderboardKey =>
  theme === 'classica' ? mode : `${theme}_${mode}`;
export const emptyLeaderboard = (): LeaderboardData => ({
  achille: [], eracle: [], intrattenimento_achille: [], intrattenimento_eracle: [],
  trash_achille: [], trash_eracle: [], mista_achille: [], mista_eracle: [],
});
const microsecondRemainder = (timestamp: string) =>
  Number((timestamp.match(/\.(\d+)/)?.[1] ?? '').padEnd(6, '0').slice(3, 6));
export const compareEntries = (a: LeaderboardEntry, b: LeaderboardEntry) =>
  b.streak - a.streak || b.score - a.score ||
  Date.parse(a.timestamp) - Date.parse(b.timestamp) ||
  microsecondRemainder(a.timestamp) - microsecondRemainder(b.timestamp) ||
  (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0);
export const localUpsert = (entries: LeaderboardEntry[], entry: LeaderboardEntry) =>
  [...entries.filter(old => old.name !== entry.name), entry].sort(compareEntries).slice(0, 5);
