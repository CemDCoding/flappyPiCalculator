/**
 * Local top-3 leaderboard.
 *
 * Storage format: key LEADERBOARD_KEY ("mataschen.leaderboard.v1", version v1),
 * value = JSON array of { initials: string(1-6 digits), score: int 0..MAX_SCORE,
 * date: "YYYY-MM-DD" }. Max MAX_ENTRIES entries, sorted by score descending.
 * Only this data is stored (data minimisation); clear() removes the key.
 * Everything read from storage is untrusted and validated.
 */
import {
  INITIALS_PATTERN,
  LEADERBOARD_KEY,
  MAX_ENTRIES,
  MAX_SCORE,
  type CreateLeaderboard,
  type ScoreEntry,
} from '../contracts/leaderboard';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidInitials(v: unknown): v is string {
  return typeof v === 'string' && INITIALS_PATTERN.test(v);
}
function isValidScore(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_SCORE;
}
function isValidDate(v: unknown): v is string {
  return typeof v === 'string' && DATE_PATTERN.test(v);
}

function sortAndTrim(list: ScoreEntry[]): ScoreEntry[] {
  // Array.prototype.sort is stable: equal scores keep existing order (older first).
  return [...list].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
}

function localDate(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const createLeaderboard: CreateLeaderboard = (storage, today = localDate) => {
  let cache: ScoreEntry[] = [];
  /** Last write to storage failed: the in-memory cache is newer than storage. */
  let unsaved = false;

  function readStored(): ScoreEntry[] {
    if (unsaved) return cache;
    let raw: string | null;
    try {
      raw = storage.getItem(LEADERBOARD_KEY);
    } catch {
      return cache;
    }
    if (raw === null) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    const valid: ScoreEntry[] = [];
    for (const item of parsed as unknown[]) {
      if (typeof item !== 'object' || item === null) continue;
      const o = item as Record<string, unknown>;
      if (isValidInitials(o.initials) && isValidScore(o.score) && isValidDate(o.date)) {
        valid.push({ initials: o.initials, score: o.score, date: o.date });
      }
    }
    return sortAndTrim(valid);
  }

  function load(): ScoreEntry[] {
    cache = readStored();
    return cache.map((e) => ({ ...e }));
  }

  function qualifies(score: number): boolean {
    if (!isValidScore(score) || score <= 0) return false;
    const list = load();
    const last = list[list.length - 1];
    return list.length < MAX_ENTRIES || last === undefined || score > last.score;
  }

  function add(initials: string, score: number): ScoreEntry[] {
    if (!isValidInitials(initials) || !isValidScore(score)) return load();
    const list = readStored();
    const next = sortAndTrim([...list, { initials, score, date: today() }]);
    cache = next;
    try {
      storage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
      unsaved = false;
    } catch {
      unsaved = true; // keep in memory
    }
    return next.map((e) => ({ ...e }));
  }

  function clear(): void {
    cache = [];
    try {
      storage.removeItem(LEADERBOARD_KEY);
      unsaved = false;
    } catch {
      unsaved = true; // keep the cleared list in memory
    }
  }

  return { load, qualifies, add, clear };
};
