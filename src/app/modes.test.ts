import { describe, expect, it } from 'vitest';
import type { Key } from '../contracts/keys';
import {
  AC_CONFIRM_MS,
  GAME_OVER_LOCK_MS,
  acHintLines,
  initialAppState,
  initialsLines,
  leaderboardLines,
  transition,
  type AppEvent,
  type AppState,
  type Effect,
} from './modes';

const key = (k: Key, now = 0): AppEvent => ({ type: 'key', key: k, now });
const frame = (now: number): AppEvent => ({ type: 'frame', now });

function run(state: AppState, ...events: AppEvent[]): { state: AppState; effects: Effect[] } {
  let s = state;
  let effects: Effect[] = [];
  for (const ev of events) {
    const t = transition(s, ev);
    s = t.state;
    effects = t.effects;
  }
  return { state: s, effects };
}

const types = (effects: Effect[]): string[] => effects.map((e) => e.type);

const inGame = (): AppState => run(initialAppState(), key('BIRD')).state;

function overState(qualifies: boolean, score = 5, at = 1000): AppState {
  return run(inGame(), { type: 'gameOver', now: at, score, qualifies }).state;
}

const inInitials = (): AppState => run(overState(true), frame(1000 + GAME_OVER_LOCK_MS)).state;
const inLeaderboard = (): AppState => run(inGame(), key('%')).state;

describe('calc mode', () => {
  it('forwards calculator keys', () => {
    const t = transition(initialAppState(), key('7'));
    expect(t.state.mode).toBe('calc');
    expect(t.effects).toEqual([{ type: 'calcKey', key: '7' }]);
  });

  it('AC in calc mode only reaches the calculator, never the leaderboard', () => {
    const t = run(initialAppState(), key('AC'), key('AC', 100));
    expect(t.effects).toEqual([{ type: 'calcKey', key: 'AC' }]);
  });

  it('BIRD resets the calculator and starts a new game', () => {
    const t = transition(initialAppState(), key('BIRD'));
    expect(t.state.mode).toBe('game');
    expect(types(t.effects)).toEqual(['resetCalc', 'newGame', 'startLoop']);
  });

  it('ignores frames', () => {
    expect(transition(initialAppState(), frame(5)).effects).toEqual([]);
  });
});

describe('game mode', () => {
  it('a digit flaps at the next step', () => {
    let t = run(inGame(), key('3'), frame(100));
    expect(t.effects).toEqual([{ type: 'step', dtMs: 0, flap: true, now: 100 }]);
    t = run(t.state, frame(116));
    expect(t.effects).toEqual([{ type: 'step', dtMs: 16, flap: false, now: 116 }]);
  });

  it('treats non-finite or negative dt as 0', () => {
    let s = run(inGame(), frame(100)).state;
    expect(transition(s, frame(50)).effects).toEqual([
      { type: 'step', dtMs: 0, flap: false, now: 50 },
    ]);
    s = { ...s, lastFrame: Number.NaN };
    expect(transition(s, frame(60)).effects).toEqual([
      { type: 'step', dtMs: 0, flap: false, now: 60 },
    ]);
  });

  it.each<Key>(['C', 'BIRD'])('%s discards the game and returns to calc', (k) => {
    const t = transition(inGame(), key(k));
    expect(t.state).toEqual(initialAppState());
    expect(types(t.effects)).toEqual(['stopLoop', 'hideCanvas', 'showCalc']);
  });

  it('% pauses the game and shows the leaderboard', () => {
    const t = transition(inGame(), key('%'));
    expect(t.state.mode).toBe('leaderboard');
    expect(t.state.paused).toBe(true);
    expect(types(t.effects)).toEqual(['stopLoop', 'showLeaderboard']);
  });

  it.each<Key>(['AC', '=', '+', 'BACK', '.', '±', '('])('ignores %s', (k) => {
    const s = inGame();
    const t = transition(s, key(k));
    expect(t.state).toEqual(s);
    expect(t.effects).toEqual([]);
  });
});

describe('game over', () => {
  it('locks input for 800 ms', () => {
    const s = overState(true);
    expect(s.overUntil).toBe(1000 + GAME_OVER_LOCK_MS);
    for (const k of ['1', 'C', '%', '=', 'BIRD'] as Key[]) {
      const t = transition(s, key(k, 1500));
      expect(t.state).toEqual(s);
      expect(t.effects).toEqual([]);
    }
    expect(transition(s, frame(1000 + GAME_OVER_LOCK_MS - 1)).effects).toEqual([]);
  });

  it('after the lock a qualifying score goes to initials', () => {
    const t = transition(overState(true, 7), frame(1000 + GAME_OVER_LOCK_MS));
    expect(t.state.mode).toBe('initials');
    expect(t.effects).toEqual([
      { type: 'stopLoop' },
      { type: 'showInitials', score: 7, initials: '' },
    ]);
  });

  it('after the lock a non-qualifying score goes to the leaderboard', () => {
    const t = transition(overState(false, 0), frame(2000));
    expect(t.state.mode).toBe('leaderboard');
    expect(t.state.paused).toBe(false);
    expect(types(t.effects)).toEqual(['stopLoop', 'showLeaderboard']);
  });

  it('digits pressed during the lock do not become initials', () => {
    const s = run(overState(true), key('1', 1100), key('2', 1200), frame(1800)).state;
    expect(s.mode).toBe('initials');
    expect(s.initials).toBe('');
  });
});

describe('initials mode', () => {
  it('appends digits up to 6', () => {
    let s = inInitials();
    for (const d of ['1', '2', '3', '4', '5', '6', '7'] as Key[]) s = transition(s, key(d)).state;
    expect(s.initials).toBe('123456');
    const t = transition(s, key('9'));
    expect(t.effects).toEqual([{ type: 'showInitials', score: 5, initials: '123456' }]);
  });

  it('BACK removes the last digit', () => {
    const t = run(inInitials(), key('1'), key('2'), key('BACK'));
    expect(t.state.initials).toBe('1');
    expect(t.effects).toEqual([{ type: 'showInitials', score: 5, initials: '1' }]);
  });

  it('= without digits is ignored', () => {
    const s = inInitials();
    expect(transition(s, key('=')).effects).toEqual([]);
    expect(transition(s, key('=')).state.mode).toBe('initials');
  });

  it('= saves and shows the leaderboard', () => {
    const t = run(inInitials(), key('1'), key('2'), key('3'), key('4'), key('='));
    expect(t.state.mode).toBe('leaderboard');
    expect(t.effects).toEqual([
      { type: 'saveScore', initials: '1234', score: 5 },
      { type: 'showLeaderboard' },
    ]);
  });

  it('C discards and shows the leaderboard', () => {
    const t = run(inInitials(), key('1'), key('C'));
    expect(t.state.mode).toBe('leaderboard');
    expect(t.effects).toEqual([{ type: 'showLeaderboard' }]);
  });

  it.each<Key>(['AC', 'BIRD', '%', '+'])('ignores %s', (k) => {
    const s = run(inInitials(), key('1')).state;
    expect(transition(s, key(k))).toEqual({ state: s, effects: [] });
  });
});

describe('leaderboard mode', () => {
  it('first AC shows the hint, second within 2 s clears', () => {
    let t = run(inLeaderboard(), key('AC', 10_000));
    expect(t.effects).toEqual([{ type: 'showAcHint' }]);
    t = run(t.state, key('AC', 10_000 + AC_CONFIRM_MS));
    expect(t.effects).toEqual([{ type: 'clearLeaderboard' }, { type: 'showLeaderboard' }]);
    expect(t.state.acAt).toBeNull();
  });

  it('second AC after more than 2 s only re-arms', () => {
    const t = run(inLeaderboard(), key('AC', 10_000), key('AC', 10_000 + AC_CONFIRM_MS + 1));
    expect(t.effects).toEqual([{ type: 'showAcHint' }]);
    expect(t.state.acAt).toBe(10_000 + AC_CONFIRM_MS + 1);
  });

  it('any other key resets the AC sequence', () => {
    const t = run(inLeaderboard(), key('AC', 0), key('+', 100));
    expect(t.state.acAt).toBeNull();
    expect(t.effects).toEqual([{ type: 'showLeaderboard' }]);
    const t2 = run(t.state, key('AC', 200));
    expect(t2.effects).toEqual([{ type: 'showAcHint' }]);
  });

  it('% resumes a paused game frozen until the next digit', () => {
    let t = transition(inLeaderboard(), key('%'));
    expect(t.state.mode).toBe('game');
    expect(t.state.frozen).toBe(true);
    expect(t.state.paused).toBe(false);
    expect(types(t.effects)).toEqual(['resumeGame', 'startLoop']);
    t = run(t.state, frame(100), frame(116));
    expect(t.effects).toEqual([{ type: 'renderGame' }]);
    t = run(t.state, key('5'), frame(132));
    expect(t.effects).toEqual([{ type: 'step', dtMs: 16, flap: true, now: 132 }]);
  });

  it('% without a paused game starts a new game', () => {
    const s = run(overState(false), frame(2000)).state;
    const t = transition(s, key('%'));
    expect(t.state.mode).toBe('game');
    expect(types(t.effects)).toEqual(['newGame', 'startLoop']);
  });

  it.each<Key>(['0', '9', '='])('%s starts a new game (paused game discarded)', (k) => {
    const t = transition(inLeaderboard(), key(k));
    expect(t.state.mode).toBe('game');
    expect(t.state.paused).toBe(false);
    expect(t.state.frozen).toBe(false);
    expect(types(t.effects)).toEqual(['newGame', 'startLoop']);
  });

  it.each<Key>(['C', 'BIRD'])('%s returns to calc', (k) => {
    const t = transition(inLeaderboard(), key(k));
    expect(t.state).toEqual(initialAppState());
    expect(t.effects).toEqual([{ type: 'showCalc' }]);
  });
});

describe('display lines', () => {
  it('builds leaderboard lines', () => {
    expect(leaderboardLines([])).toEqual(['BESTENLISTE', '– leer –']);
    expect(leaderboardLines(['a', 'b', 'c', 'd'])).toEqual(['BESTENLISTE', 'a', 'b', 'c']);
  });

  it('builds initials and hint lines', () => {
    expect(initialsLines(12, '34')).toEqual(['NEUER REKORD 12', 'Kürzel: 34_']);
    expect(acHintLines()).toEqual(['BESTENLISTE', 'AC nochmal = löschen']);
  });
});
