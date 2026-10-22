import { describe, expect, it } from 'vitest';
import { calcEngine } from '../calc';
import type { Scheduler } from '../contracts/app';
import type { GameEngine, GameState } from '../contracts/game';
import type { Key } from '../contracts/keys';
import { LEADERBOARD_KEY, type StorageLike } from '../contracts/leaderboard';
import type { CalculatorView } from '../contracts/ui';
import { DEFAULT_GAME_CONFIG, gameEngine } from '../game';
import { createLeaderboard } from '../leaderboard';
import { createApp, type AppDeps } from './controller';
import { GAME_OVER_LOCK_MS } from './modes';

type Shown =
  | { kind: 'text'; main: string; sub: string | undefined }
  | { kind: 'lines'; lines: string[] }
  | { kind: 'canvas' }
  | { kind: 'hide' };

function fakeView() {
  const shown: Shown[] = [];
  let handler: ((k: Key) => void) | null = null;
  const fakeCtx = {} as CanvasRenderingContext2D;
  const view: CalculatorView = {
    display: {
      showText: (main, sub) => void shown.push({ kind: 'text', main, sub }),
      showLines: (lines) => void shown.push({ kind: 'lines', lines: [...lines] }),
      showCanvas: () => {
        shown.push({ kind: 'canvas' });
        return fakeCtx;
      },
      hideCanvas: () => void shown.push({ kind: 'hide' }),
    },
    keypad: {
      onKey(h) {
        handler = h;
        return () => {
          handler = null;
        };
      },
    },
  };
  return {
    view,
    shown,
    last: () => shown.at(-1),
    lastText: () => {
      const s = shown.at(-1);
      return s?.kind === 'text' ? [s.main, s.sub] : undefined;
    },
    press: (...keys: Key[]) => keys.forEach((k) => handler?.(k)),
    hasHandler: () => handler !== null,
  };
}

function fakeScheduler() {
  let nextId = 1;
  const pending = new Map<number, (t: number) => void>();
  const scheduler: Scheduler = {
    request(cb) {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancel(id) {
      pending.delete(id);
    },
  };
  return {
    scheduler,
    pending: () => pending.size,
    frame(t: number) {
      const cbs = [...pending.values()];
      pending.clear();
      cbs.forEach((cb) => cb(t));
    },
  };
}

function fakeStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

/** Fake engine: running after the first flap, over with `score` after `overAfter` steps. */
function fakeEngine(score: number, overAfter: number) {
  let steps = 0;
  const flaps: boolean[] = [];
  const engine: GameEngine = {
    create: () => ({ status: 'ready', birdY: 10, birdVy: 0, pipes: [], score: 0 }),
    step(state, _dt, flap): GameState {
      flaps.push(flap);
      if (state.status === 'over') return state;
      if (state.status === 'ready' && !flap) return state;
      steps += 1;
      return steps >= overAfter
        ? { ...state, status: 'over', score }
        : { ...state, status: 'running', score: 0 };
    },
  };
  return { engine, flaps, steps: () => steps };
}

function setup(over: { score: number; after: number } = { score: 5, after: 3 }) {
  const view = fakeView();
  const sched = fakeScheduler();
  const storage = fakeStorage();
  const fe = fakeEngine(over.score, over.after);
  let time = 0;
  const renders: GameState[] = [];
  const deps: AppDeps = {
    view: view.view,
    calc: calcEngine,
    leaderboard: createLeaderboard(storage, () => '2026-10-21'),
    game: fe.engine,
    scheduler: sched.scheduler,
    now: () => time,
    render: (_ctx, s) => void renders.push(s),
    rng: () => 0.5,
  };
  const app = createApp(deps);
  const frame = (t: number) => {
    time = t;
    sched.frame(t);
  };
  const at = (t: number) => {
    time = t;
  };
  return { ...view, sched, storage, fe, app, frame, at, renders };
}

/** Starts a game and plays until it is over and the lock has elapsed. */
function playToEnd(f: ReturnType<typeof setup>, start = 0): number {
  f.press('BIRD', '1');
  let t = start;
  for (let i = 0; i < 5; i++) f.frame((t += 16));
  f.frame((t += GAME_OVER_LOCK_MS));
  return t;
}

describe('createApp: calculator mode (AP-04 unchanged)', () => {
  it('shows initial state 0', () => {
    const f = setup();
    expect(f.lastText()?.[0]).toBe('0');
  });

  it('computes 2 + 3 * 4 = 14', () => {
    const f = setup();
    f.press('2', '+', '3', '*', '4', '=');
    expect(f.lastText()).toEqual(['14', '=']);
  });

  it('works with default dependencies (view + calc only)', () => {
    const v = fakeView();
    const app = createApp({ view: v.view, calc: calcEngine });
    v.press('2', '+', '3', '=');
    expect(v.lastText()).toEqual(['5', '=']);
    app.destroy();
  });

  it('shows Error for 5 / 0 =, AC clears it', () => {
    const f = setup();
    f.press('5', '/', '0', '=');
    expect(f.lastText()?.[0]).toBe('Error');
    f.press('AC');
    expect(f.lastText()?.[0]).toBe('0');
  });

  it('C clears the current entry, AC clears everything', () => {
    const f = setup();
    f.press('1', '2', '+', '3', '4', 'C');
    const main = String(f.lastText()?.[0]);
    expect(main).toContain('12');
    expect(main).not.toContain('34');
    f.press('AC');
    expect(f.lastText()?.[0]).toBe('0');
  });

  it('C after Error resets to 0', () => {
    const f = setup();
    f.press('5', '/', '0', '=', 'C');
    expect(f.lastText()?.[0]).toBe('0');
  });

  it('destroy unregisters the handler and stops the loop', () => {
    const f = setup();
    f.press('BIRD');
    expect(f.sched.pending()).toBe(1);
    f.app.destroy();
    expect(f.hasHandler()).toBe(false);
    expect(f.sched.pending()).toBe(0);
  });
});

describe('createApp: game mode', () => {
  it('BIRD shows the canvas, starts the loop and resets the calculator', () => {
    const f = setup();
    f.press('7', '+', '1');
    f.press('BIRD');
    expect(f.last()).toEqual({ kind: 'canvas' });
    expect(f.renders).toHaveLength(1);
    expect(f.sched.pending()).toBe(1);
    f.press('C');
    expect(f.sched.pending()).toBe(0);
    expect(f.shown.slice(-2)).toEqual([{ kind: 'hide' }, { kind: 'text', main: '0', sub: '' }]);
  });

  it('each frame steps and renders; digits flap at the next step', () => {
    const f = setup({ score: 1, after: 100 });
    f.press('BIRD');
    f.frame(16);
    f.press('4');
    f.frame(32);
    f.frame(48);
    expect(f.fe.flaps).toEqual([false, true, false]);
    expect(f.renders).toHaveLength(4);
    expect(f.sched.pending()).toBe(1);
  });

  it('works with the real engine without errors', () => {
    const v = fakeView();
    const sched = fakeScheduler();
    createApp({
      view: v.view,
      calc: calcEngine,
      game: gameEngine,
      gameConfig: DEFAULT_GAME_CONFIG,
      scheduler: sched.scheduler,
      render: () => {},
      now: () => 0,
      rng: () => 0.5,
    });
    v.press('BIRD', '1');
    for (let t = 16; t < 10_000 && sched.pending() > 0; t += 16) sched.frame(t);
    expect(sched.pending()).toBe(0);
    // score 0 never qualifies -> leaderboard
    expect(v.last()).toEqual({ kind: 'lines', lines: ['BESTENLISTE', '– leer –'] });
  });

  it('% pauses (loop stopped), % again resumes with the next digit', () => {
    const f = setup({ score: 1, after: 100 });
    f.press('BIRD', '1');
    f.frame(16);
    f.frame(32);
    const steps = f.fe.steps();
    f.press('%');
    expect(f.sched.pending()).toBe(0);
    expect(f.last()).toEqual({ kind: 'lines', lines: ['BESTENLISTE', '– leer –'] });
    f.press('%');
    expect(f.last()).toEqual({ kind: 'canvas' });
    expect(f.sched.pending()).toBe(1);
    f.frame(5000);
    f.frame(5016);
    expect(f.fe.steps()).toBe(steps);
    f.press('2');
    f.frame(5032);
    expect(f.fe.steps()).toBe(steps + 1);
    expect(f.fe.flaps.at(-1)).toBe(true);
  });
});

describe('createApp: game over, initials, leaderboard', () => {
  it('qualifying score: lock, initials, = saves to storage', () => {
    const f = setup({ score: 5, after: 3 });
    f.press('BIRD', '1');
    f.frame(16);
    f.frame(32);
    f.frame(48); // over
    f.press('1', '2'); // locked
    f.frame(48 + GAME_OVER_LOCK_MS - 1);
    expect(f.sched.pending()).toBe(1);
    f.frame(48 + GAME_OVER_LOCK_MS);
    expect(f.sched.pending()).toBe(0);
    expect(f.last()).toEqual({ kind: 'lines', lines: ['NEUER REKORD 5', 'Kürzel: _'] });
    f.press('1', '2', '3', '4', '5');
    f.press('BACK');
    expect(f.last()).toEqual({ kind: 'lines', lines: ['NEUER REKORD 5', 'Kürzel: 1234_'] });
    f.press('=');
    expect(f.last()).toEqual({
      kind: 'lines',
      lines: ['BESTENLISTE', '1.   1234    5  21.10.26'],
    });
    expect(JSON.parse(f.storage.data.get(LEADERBOARD_KEY) ?? '[]')).toEqual([
      { initials: '1234', score: 5, date: '2026-10-21' },
    ]);
  });

  it('C in initials discards the score', () => {
    const f = setup();
    playToEnd(f);
    f.press('9', 'C');
    expect(f.last()).toEqual({ kind: 'lines', lines: ['BESTENLISTE', '– leer –'] });
    expect(f.storage.data.has(LEADERBOARD_KEY)).toBe(false);
  });

  it('double AC within 2 s clears only in the leaderboard', () => {
    const f = setup();
    playToEnd(f);
    f.press('7', '=');
    expect(f.storage.data.has(LEADERBOARD_KEY)).toBe(true);
    f.at(20_000);
    f.press('AC');
    expect(f.last()).toEqual({ kind: 'lines', lines: ['BESTENLISTE', 'AC nochmal = löschen'] });
    expect(f.storage.data.has(LEADERBOARD_KEY)).toBe(true);
    f.at(21_000);
    f.press('AC');
    expect(f.storage.data.has(LEADERBOARD_KEY)).toBe(false);
    expect(f.last()).toEqual({ kind: 'lines', lines: ['BESTENLISTE', '– leer –'] });
  });

  it('AC in calc and game mode never clears the leaderboard', () => {
    const f = setup();
    playToEnd(f);
    f.press('7', '=', 'C'); // saved, back to calc
    f.press('AC', 'AC');
    f.press('BIRD', 'AC', 'AC', 'C');
    expect(f.storage.data.has(LEADERBOARD_KEY)).toBe(true);
  });

  it('leaderboard: digit starts a new game, C returns to calc', () => {
    const f = setup();
    const t = playToEnd(f);
    f.press('C'); // discard initials -> leaderboard
    f.press('3');
    expect(f.last()).toEqual({ kind: 'canvas' });
    expect(f.sched.pending()).toBe(1);
    f.frame(t + 16);
    f.press('%', 'C');
    expect(f.sched.pending()).toBe(0);
    expect(f.lastText()).toEqual(['0', '']);
  });
});
