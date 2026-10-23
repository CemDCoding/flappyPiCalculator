import { describe, expect, it } from 'vitest';
import { LEADERBOARD_KEY } from '../contracts/leaderboard';
import type { StorageLike } from '../contracts/leaderboard';
import { createLeaderboard, formatEntry } from './index';

function fake(initial?: string): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(LEADERBOARD_KEY, initial);
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error('x');
  },
  setItem: () => {
    throw new Error('x');
  },
  removeItem: () => {
    throw new Error('x');
  },
};

const today = () => '2026-10-21';

describe('leaderboard', () => {
  it('keeps max 3 sorted entries', () => {
    const lb = createLeaderboard(fake(), today);
    lb.add('1', 5);
    lb.add('2', 50);
    lb.add('3', 20);
    const r = lb.add('4', 30);
    expect(r.map((e) => e.score)).toEqual([50, 30, 20]);
    expect(lb.load()).toEqual(r);
  });

  it('qualifies', () => {
    const lb = createLeaderboard(fake(), today);
    expect(lb.qualifies(0)).toBe(false);
    expect(lb.qualifies(1)).toBe(true);
    lb.add('1', 10);
    lb.add('2', 20);
    lb.add('3', 30);
    expect(lb.qualifies(10)).toBe(false);
    expect(lb.qualifies(11)).toBe(true);
  });

  it.each([
    ['not json', '{{'],
    ['object', '{"a":1}'],
    ['null', 'null'],
    [
      'bad entries',
      JSON.stringify([
        { initials: '1234567', score: 1, date: '2026-01-01' },
        { initials: 'abc', score: 1, date: '2026-01-01' },
        { initials: '1', score: -1, date: '2026-01-01' },
        { initials: '1', score: 1e9, date: '2026-01-01' },
        { initials: '1', score: 1.5, date: '2026-01-01' },
        { initials: '1', score: 1, date: '<script>' },
        { initials: '<script>', score: 1, date: '2026-01-01' },
        null,
        5,
      ]),
    ],
  ])('rejects corrupt data: %s', (_n, raw) => {
    const lb = createLeaderboard(fake(raw), today);
    expect(lb.load()).toEqual([]);
  });

  it('keeps valid entries among invalid ones and trims', () => {
    const raw = JSON.stringify([
      { initials: '1', score: 1, date: '2026-01-01' },
      { initials: 'x', score: 9, date: '2026-01-01' },
      { initials: '2', score: 2, date: '2026-01-01' },
      { initials: '3', score: 3, date: '2026-01-01' },
      { initials: '4', score: 4, date: '2026-01-01' },
    ]);
    expect(
      createLeaderboard(fake(raw), today)
        .load()
        .map((e) => e.score),
    ).toEqual([4, 3, 2]);
  });

  it('ignores invalid add input', () => {
    const lb = createLeaderboard(fake(), today);
    lb.add('1', 10);
    expect(lb.add('abc', 99)).toHaveLength(1);
    expect(lb.add('1', -5)).toHaveLength(1);
    expect(lb.add('1', 2000000)).toHaveLength(1);
    expect(lb.add('1234567', 5)).toHaveLength(1);
  });

  it('clear removes data', () => {
    const s = fake();
    const lb = createLeaderboard(s, today);
    lb.add('1', 10);
    lb.clear();
    expect(s.data.has(LEADERBOARD_KEY)).toBe(false);
    expect(lb.load()).toEqual([]);
  });

  it('survives throwing storage', () => {
    const lb = createLeaderboard(throwing, today);
    expect(lb.load()).toEqual([]);
    expect(lb.qualifies(5)).toBe(true);
    expect(lb.add('1', 5)).toHaveLength(1);
    expect(() => lb.clear()).not.toThrow();
  });

  it('keeps a new entry in memory when only setItem fails', () => {
    const stored = JSON.stringify([{ initials: '1', score: 10, date: '2026-01-01' }]);
    const s = fake(stored);
    const lb = createLeaderboard(
      {
        ...s,
        setItem: () => {
          throw new Error('quota');
        },
      },
      today,
    );
    lb.add('2', 20);
    expect(lb.load().map((e) => e.score)).toEqual([20, 10]);
    expect(lb.qualifies(5)).toBe(true);
    lb.add('3', 5);
    expect(lb.load().map((e) => e.score)).toEqual([20, 10, 5]);
    expect(lb.qualifies(5)).toBe(false);
    expect(s.data.get(LEADERBOARD_KEY)).toBe(stored);
  });

  it('writes the in-memory list once setItem works again', () => {
    const s = fake();
    let fail = true;
    const lb = createLeaderboard(
      {
        ...s,
        setItem: (k, v) => {
          if (fail) throw new Error('quota');
          s.setItem(k, v);
        },
      },
      today,
    );
    lb.add('1', 10);
    fail = false;
    lb.add('2', 20);
    expect(JSON.parse(s.data.get(LEADERBOARD_KEY) ?? '[]')).toEqual([
      { initials: '2', score: 20, date: '2026-10-21' },
      { initials: '1', score: 10, date: '2026-10-21' },
    ]);
    expect(lb.load().map((e) => e.score)).toEqual([20, 10]);
  });

  it('keeps the list cleared in memory when only removeItem fails', () => {
    const s = fake(JSON.stringify([{ initials: '1', score: 10, date: '2026-01-01' }]));
    const lb = createLeaderboard(
      {
        ...s,
        removeItem: () => {
          throw new Error('denied');
        },
      },
      today,
    );
    lb.clear();
    expect(lb.load()).toEqual([]);
  });

  it('keeps older entries first on equal scores', () => {
    const lb = createLeaderboard(fake(), today);
    lb.add('1', 10);
    lb.add('2', 10);
    expect(lb.load().map((e) => e.initials)).toEqual(['1', '2']);
  });

  it('does not qualify a score equal to the third place', () => {
    const lb = createLeaderboard(fake(), today);
    lb.add('1', 30);
    lb.add('2', 20);
    lb.add('3', 10);
    expect(lb.qualifies(10)).toBe(false);
    const r = lb.add('4', 10);
    expect(r.map((e) => e.initials)).toEqual(['1', '2', '3']);
  });

  it('uses default date', () => {
    const r = createLeaderboard(fake()).add('1', 5);
    expect(r[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatEntry', () => {
  it('formats', () => {
    expect(formatEntry({ initials: '123456', score: 42, date: '2026-10-21' }, 1)).toBe(
      '1. 123456   42  21.10.26',
    );
  });
});
