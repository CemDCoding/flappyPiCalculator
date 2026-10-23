import { describe, expect, it } from 'vitest';
import type { GameState } from '../contracts/game';
import { DEFAULT_GAME_CONFIG } from './config';
import { renderGame } from './render';

function mockCtx() {
  const calls: { name: string; args: unknown[] }[] = [];
  const target: Record<string, unknown> = {};
  const ctx = new Proxy(target, {
    get(t, prop: string) {
      if (prop in t) return t[prop];
      return (...args: unknown[]) => {
        calls.push({ name: prop, args });
      };
    },
    set(t, prop: string, value) {
      t[prop] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

function state(over: Partial<GameState>): GameState {
  return { status: 'running', birdY: 20, birdVy: 0, pipes: [], score: 3, ...over };
}

describe('renderGame', () => {
  for (const status of ['ready', 'running', 'over'] as const) {
    it(`draws without error for ${status}`, () => {
      const { ctx } = mockCtx();
      expect(() => renderGame(ctx, state({ status }), DEFAULT_GAME_CONFIG)).not.toThrow();
    });
  }

  it('draws pi via fillText', () => {
    const { ctx, calls } = mockCtx();
    renderGame(ctx, state({}), DEFAULT_GAME_CONFIG);
    expect(calls.some((c) => c.name === 'fillText' && c.args[0] === 'π')).toBe(true);
  });

  it('draws two rects per pipe (plus background)', () => {
    const { ctx, calls } = mockCtx();
    const pipes = [
      { x: 60, gapY: 10, passed: false },
      { x: 110, gapY: 15, passed: false },
      { x: 160, gapY: 5, passed: false },
    ];
    renderGame(ctx, state({ pipes }), DEFAULT_GAME_CONFIG);
    expect(calls.filter((c) => c.name === 'fillRect').length).toBe(1 + 2 * pipes.length);
  });

  it('uses integer coordinates for pipes', () => {
    const { ctx, calls } = mockCtx();
    renderGame(
      ctx,
      state({ pipes: [{ x: 60.4, gapY: 10.6, passed: false }] }),
      DEFAULT_GAME_CONFIG,
    );
    for (const c of calls.filter((k) => k.name === 'fillRect')) {
      expect(c.args.every((a) => Number.isInteger(a))).toBe(true);
    }
  });

  it('shows hint when ready and GAME OVER when over', () => {
    const r = mockCtx();
    renderGame(r.ctx, state({ status: 'ready' }), DEFAULT_GAME_CONFIG);
    expect(r.calls.some((c) => c.name === 'fillText' && String(c.args[0]).includes('0-9'))).toBe(
      true,
    );
    const o = mockCtx();
    renderGame(o.ctx, state({ status: 'over' }), DEFAULT_GAME_CONFIG);
    expect(o.calls.some((c) => c.name === 'fillText' && c.args[0] === 'GAME OVER')).toBe(true);
  });

  it('draws the score', () => {
    const { ctx, calls } = mockCtx();
    renderGame(ctx, state({ score: 42 }), DEFAULT_GAME_CONFIG);
    expect(calls.some((c) => c.name === 'fillText' && c.args[0] === '42')).toBe(true);
  });
});
