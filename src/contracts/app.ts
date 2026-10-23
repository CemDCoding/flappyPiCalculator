export type Mode = 'calc' | 'game' | 'initials' | 'leaderboard';

export interface Scheduler {
  request(cb: (timeMs: number) => void): number;
  cancel(id: number): void;
}
