/**
 * Mode state machine (pure): calc -> game -> initials -> leaderboard.
 * transition(state, event) returns the next state plus effects; the
 * controller executes the effects (display, storage, game loop).
 * Key mapping per PE-10, PE-11, PE-25.
 */
import type { Mode } from '../contracts/app';
import { isDigitKey, type CalcKey, type Key } from '../contracts/keys';
import { MAX_ENTRIES, MAX_INITIALS } from '../contracts/leaderboard';

/** Input lock after game over, so flap digits do not end up as initials. */
export const GAME_OVER_LOCK_MS = 800;
/** Second AC within this window clears the leaderboard. */
export const AC_CONFIRM_MS = 2000;

export const LEADERBOARD_TITLE = 'BESTENLISTE';
export const LEADERBOARD_EMPTY = '– leer –';
export const AC_HINT = 'AC nochmal = löschen';

export interface AppState {
  mode: Mode;
  /** game: a digit was pressed, flap at the next step. */
  flap: boolean;
  /** game: resumed after pause, frozen until the next digit. */
  frozen: boolean;
  /** game: time of the previous frame (null = none yet). */
  lastFrame: number | null;
  /** game over: input locked until this time (null = game not over). */
  overUntil: number | null;
  /** game over: result qualifies for the top 3. */
  qualifies: boolean;
  /** score of the finished game (initials mode). */
  score: number;
  /** digits entered so far (initials mode). */
  initials: string;
  /** a paused game exists (leaderboard opened with %). */
  paused: boolean;
  /** leaderboard: time of the first AC (null = not armed). */
  acAt: number | null;
}

export type AppEvent =
  | { type: 'key'; key: Key; now: number }
  | { type: 'frame'; now: number }
  | { type: 'gameOver'; now: number; score: number; qualifies: boolean };

export type Effect =
  | { type: 'calcKey'; key: CalcKey }
  | { type: 'resetCalc' }
  | { type: 'showCalc' }
  | { type: 'newGame' }
  | { type: 'resumeGame' }
  | { type: 'step'; dtMs: number; flap: boolean; now: number }
  | { type: 'renderGame' }
  | { type: 'startLoop' }
  | { type: 'stopLoop' }
  | { type: 'hideCanvas' }
  | { type: 'showInitials'; score: number; initials: string }
  | { type: 'saveScore'; initials: string; score: number }
  | { type: 'showLeaderboard' }
  | { type: 'showAcHint' }
  | { type: 'clearLeaderboard' };

export interface Transition {
  state: AppState;
  effects: Effect[];
}

export function initialAppState(): AppState {
  return {
    mode: 'calc',
    flap: false,
    frozen: false,
    lastFrame: null,
    overUntil: null,
    qualifies: false,
    score: 0,
    initials: '',
    paused: false,
    acAt: null,
  };
}

/** Lines for the initials prompt. */
export function initialsLines(score: number, initials: string): string[] {
  return [`NEUER REKORD ${score}`, `Kürzel: ${initials}_`];
}

/** Heading plus up to MAX_ENTRIES entries (already rendered with formatEntry). */
export function leaderboardLines(entries: string[]): string[] {
  return [
    LEADERBOARD_TITLE,
    ...(entries.length > 0 ? entries.slice(0, MAX_ENTRIES) : [LEADERBOARD_EMPTY]),
  ];
}

export function acHintLines(): string[] {
  return [LEADERBOARD_TITLE, AC_HINT];
}

function gameState(base: AppState, frozen: boolean): AppState {
  return {
    ...base,
    mode: 'game',
    flap: false,
    frozen,
    lastFrame: null,
    overUntil: null,
    qualifies: false,
    acAt: null,
  };
}

function startNewGame(s: AppState): Transition {
  return {
    state: { ...gameState(s, false), paused: false, score: 0, initials: '' },
    effects: [{ type: 'newGame' }, { type: 'startLoop' }],
  };
}

/** Back to the calculator; a paused game is discarded. */
function toCalc(extra: Effect[]): Transition {
  return { state: initialAppState(), effects: [...extra, { type: 'showCalc' }] };
}

function toLeaderboard(s: AppState, paused: boolean, extra: Effect[] = []): Transition {
  return {
    state: { ...s, mode: 'leaderboard', paused, acAt: null, flap: false, overUntil: null },
    effects: [...extra, { type: 'showLeaderboard' }],
  };
}

function onCalc(s: AppState, ev: AppEvent): Transition {
  if (ev.type !== 'key') return { state: s, effects: [] };
  if (ev.key === 'BIRD') {
    const t = startNewGame(s);
    return { state: t.state, effects: [{ type: 'resetCalc' }, ...t.effects] };
  }
  return { state: s, effects: [{ type: 'calcKey', key: ev.key }] };
}

function onGame(s: AppState, ev: AppEvent): Transition {
  if (ev.type === 'gameOver') {
    return {
      state: {
        ...s,
        flap: false,
        overUntil: ev.now + GAME_OVER_LOCK_MS,
        qualifies: ev.qualifies,
        score: ev.score,
      },
      effects: [],
    };
  }

  if (s.overUntil !== null) {
    // Input lock; afterwards switch automatically.
    if (ev.type !== 'frame' || ev.now < s.overUntil) return { state: s, effects: [] };
    if (s.qualifies) {
      return {
        state: { ...s, mode: 'initials', initials: '', overUntil: null, paused: false },
        effects: [{ type: 'stopLoop' }, { type: 'showInitials', score: s.score, initials: '' }],
      };
    }
    return toLeaderboard(s, false, [{ type: 'stopLoop' }]);
  }

  if (ev.type === 'frame') {
    const raw = s.lastFrame === null ? 0 : ev.now - s.lastFrame;
    const dtMs = Number.isFinite(raw) && raw > 0 ? raw : 0;
    const next: AppState = { ...s, lastFrame: ev.now };
    if (s.frozen) return { state: next, effects: [{ type: 'renderGame' }] };
    return {
      state: { ...next, flap: false },
      effects: [{ type: 'step', dtMs, flap: s.flap, now: ev.now }],
    };
  }

  const { key } = ev;
  if (isDigitKey(key)) return { state: { ...s, flap: true, frozen: false }, effects: [] };
  if (key === 'C' || key === 'BIRD') return toCalc([{ type: 'stopLoop' }, { type: 'hideCanvas' }]);
  if (key === '%') return toLeaderboard(s, true, [{ type: 'stopLoop' }]);
  return { state: s, effects: [] };
}

function onInitials(s: AppState, ev: AppEvent): Transition {
  if (ev.type !== 'key') return { state: s, effects: [] };
  const { key } = ev;
  if (isDigitKey(key) || key === 'BACK') {
    const initials =
      key === 'BACK' ? s.initials.slice(0, -1) : (s.initials + key).slice(0, MAX_INITIALS);
    return {
      state: { ...s, initials },
      effects: [{ type: 'showInitials', score: s.score, initials }],
    };
  }
  if (key === '=') {
    if (s.initials.length === 0) return { state: s, effects: [] };
    return toLeaderboard({ ...s, initials: '' }, false, [
      { type: 'saveScore', initials: s.initials, score: s.score },
    ]);
  }
  if (key === 'C') return toLeaderboard({ ...s, initials: '' }, false);
  return { state: s, effects: [] };
}

function onLeaderboard(s: AppState, ev: AppEvent): Transition {
  if (ev.type !== 'key') return { state: s, effects: [] };
  const { key, now } = ev;

  if (key === 'AC') {
    if (s.acAt !== null && now - s.acAt <= AC_CONFIRM_MS) {
      return {
        state: { ...s, acAt: null },
        effects: [{ type: 'clearLeaderboard' }, { type: 'showLeaderboard' }],
      };
    }
    return { state: { ...s, acAt: now }, effects: [{ type: 'showAcHint' }] };
  }

  // Every other key resets the AC sequence.
  const wasArmed = s.acAt !== null;
  const r: AppState = { ...s, acAt: null };

  if (key === '%') {
    if (r.paused) {
      return {
        state: { ...gameState(r, true), paused: false },
        effects: [{ type: 'resumeGame' }, { type: 'startLoop' }],
      };
    }
    return startNewGame(r);
  }
  if (isDigitKey(key) || key === '=') return startNewGame(r);
  if (key === 'C' || key === 'BIRD') return toCalc([]);
  return { state: r, effects: wasArmed ? [{ type: 'showLeaderboard' }] : [] };
}

export function transition(state: AppState, event: AppEvent): Transition {
  switch (state.mode) {
    case 'calc':
      return onCalc(state, event);
    case 'game':
      return onGame(state, event);
    case 'initials':
      return onInitials(state, event);
    case 'leaderboard':
      return onLeaderboard(state, event);
  }
}
