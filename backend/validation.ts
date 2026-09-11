import { z } from 'zod';
import { modes, themes } from '../shared/leaderboard.js';

const integer = z.number().int().min(0).max(2147483647);
export const scopeSchema = z.object({ theme: z.enum(themes), mode: z.enum(modes).optional() }).strict();
// Historical rows may have longer names/older scoring rules: do not silently discard them.
export const historicalSchema = z.object({
  mode: z.enum(modes), theme: z.enum(themes),
  name: z.string().min(1).max(100).refine(name => name.trim().length > 0 && !name.includes('\0')),
  streak: integer, score: integer,
});

export function maximumScore(mode: string, theme: string, streak: number) {
  if (mode === 'achille') {
    // Difficulty <= 7, time bonus <= 1; each correct answer is at most 80 points.
    const multiplier = streak <= 5 ? 0.75 + 0.25 * streak : 2 + 0.2 * (streak - 5);
    return Math.round(80 * streak * multiplier);
  }
  const levels = theme === 'mista' ? 15 : 12;
  const sum = Array.from({ length: streak }, (_, i) => Math.round(100 * (0.75 + 0.25 * (i + 1)) * 1.05))
    .reduce((a, b) => a + b, 0);
  // Four unused hints multiply the final winning score by three; partial runs have no bonus.
  return sum * (streak === levels ? 3 : 1);
}

export const submissionSchema = historicalSchema.extend({
  // Deliberately reject ASCII control characters in player names.
  // eslint-disable-next-line no-control-regex
  name: z.string().trim().min(1).max(20).refine(name => !/[\u0000-\u001f\u007f]/.test(name)),
}).strict().superRefine((row, ctx) => {
  if (row.mode === 'eracle' && row.streak > (row.theme === 'mista' ? 15 : 12)) {
    ctx.addIssue({ code: 'custom', message: 'Numero di livelli impossibile' });
    return;
  }
  if (row.score > maximumScore(row.mode, row.theme, row.streak)) {
    ctx.addIssue({ code: 'custom', message: 'Punteggio impossibile' });
  }
});
