export const LEADERBOARD_KEY = 'mataschen.leaderboard.v1';
export const MAX_ENTRIES = 3;
export const MAX_INITIALS = 6;
export const MAX_SCORE = 999999;
export const INITIALS_PATTERN = /^\d{1,6}$/;

export interface ScoreEntry {
  initials: string;
  score: number;
  /** JJJJ-MM-TT, lokales Datum. */
  date: string;
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface LeaderboardStore {
  load(): ScoreEntry[];
  qualifies(score: number): boolean;
  add(initials: string, score: number): ScoreEntry[];
  clear(): void;
}

export type CreateLeaderboard = (storage: StorageLike, today?: () => string) => LeaderboardStore;
