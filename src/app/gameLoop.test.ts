import { describe, expect, it } from 'vitest';
import type { Scheduler } from '../contracts/app';
import { createGameLoop } from './gameLoop';
import { createMemoryStorage, pickStorage } from './memoryStorage';

function fakeScheduler() {
  let nextId = 1;
  const pending = new Map<number, (t: number) => void>();
  const scheduler: Scheduler = {
    request: (cb) => {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancel: (id) => void pending.delete(id),
  };
  const frame = (t: number) => {
    const cbs = [...pending.values()];
    pending.clear();
    cbs.forEach((cb) => cb(t));
  };
  return { scheduler, frame, pending: () => pending.size };
}

describe('createGameLoop', () => {
  it('calls onFrame each frame with at most one pending request', () => {
    const s = fakeScheduler();
    const times: number[] = [];
    const loop = createGameLoop(s.scheduler, (t) => times.push(t));
    loop.start();
    loop.start();
    expect(s.pending()).toBe(1);
    s.frame(1);
    s.frame(2);
    expect(times).toEqual([1, 2]);
    expect(s.pending()).toBe(1);
  });

  it('stop cancels the pending frame', () => {
    const s = fakeScheduler();
    const loop = createGameLoop(s.scheduler, () => {});
    loop.start();
    loop.stop();
    expect(s.pending()).toBe(0);
    expect(loop.isRunning()).toBe(false);
  });

  it('stop inside onFrame does not reschedule', () => {
    const s = fakeScheduler();
    const loop = createGameLoop(s.scheduler, () => loop.stop());
    loop.start();
    s.frame(1);
    expect(s.pending()).toBe(0);
  });
});

describe('storage fallback', () => {
  it('memory storage stores and removes values', () => {
    const m = createMemoryStorage();
    m.setItem('k', 'v');
    expect(m.getItem('k')).toBe('v');
    m.removeItem('k');
    expect(m.getItem('k')).toBeNull();
  });

  it('pickStorage falls back when access throws or is missing', () => {
    const throwing = pickStorage(() => {
      throw new Error('denied');
    });
    throwing.setItem('a', '1');
    expect(throwing.getItem('a')).toBe('1');
    expect(pickStorage(() => null).getItem('a')).toBeNull();
    const real = createMemoryStorage();
    expect(pickStorage(() => real)).toBe(real);
  });
});
