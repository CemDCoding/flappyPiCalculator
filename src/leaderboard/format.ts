import type { ScoreEntry } from '../contracts/leaderboard';

/** "1. 123456   42  21.10.26" (rank, initials padded to 6, score padded to 4, date DD.MM.YY). */
export function formatEntry(entry: ScoreEntry, rank: number): string {
  const [y = '', m = '', d = ''] = entry.date.split('-');
  const date = `${d}.${m}.${y.slice(2)}`;
  return `${rank}. ${entry.initials.padStart(6, ' ')} ${String(entry.score).padStart(4, ' ')}  ${date}`;
}
