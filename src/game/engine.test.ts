import { describe, expect, it } from 'vitest';
import { MAX_STEP_MS } from '../contracts/game';
import type { GameState } from '../contracts/game';
import { DEFAULT_GAME_CONFIG as C } from './config';
import { gameEngine as e } from './engine';

const rng = () => 0.5;
const running = (o: Partial<GameState> = {}): GameState => ({
  ...e.create(C),
  status: 'running',
  ...o,
});

describe('gameEngine', () => {
  it('creates a ready state centered without pipes', () => {
    const s = e.create(C);
    expect(s.status).toBe('ready');
    expect(s.pipes).toEqual([]);
    expect(s.score).toBe(0);
    expect(s.birdY + C.birdSize / 2).toBeCloseTo((C.height - C.groundHeight) / 2);
  });

  it('keeps bird still while ready without flap', () => {
    const s = e.create(C);
    expect(e.step(s, 16, false, C, rng)).toBe(s);
  });

  it('starts running on flap', () => {
    const s = e.step(e.create(C), 16, true, C, rng);
    expect(s.status).toBe('running');
    expect(s.birdVy).toBeLessThan(0);
  });

  it('applies gravity', () => {
    const s0 = running();
    const s = e.step(s0, 20, false, C, rng);
    expect(s.birdVy).toBeCloseTo(C.gravity * 0.02);
    expect(s.birdY).toBeGreaterThan(s0.birdY);
  });

  it('flap sets upward velocity', () => {
    const s = e.step(running({ birdVy: 50 }), 20, true, C, rng);
    expect(s.birdVy).toBeCloseTo(C.flapVelocity + C.gravity * 0.02);
    expect(s.birdY).toBeLessThan(running().birdY);
  });

  it('does not mutate input', () => {
    const s0 = running({ pipes: [{ x: 60, gapY: 10, passed: false }] });
    const copy = JSON.parse(JSON.stringify(s0));
    e.step(s0, 20, true, C, rng);
    expect(s0).toEqual(copy);
  });

  it('spawns first pipe at right edge with margin-respecting gap', () => {
    const lo = e.step(running(), 16, false, C, () => 0);
    const hi = e.step(running(), 16, false, C, () => 0.999999);
    expect(lo.pipes).toHaveLength(1);
    expect(lo.pipes[0]!.x).toBe(C.width);
    expect(lo.pipes[0]!.gapY).toBeGreaterThanOrEqual(4);
    expect(hi.pipes[0]!.gapY + C.pipeGap).toBeLessThanOrEqual(C.height - C.groundHeight - 4);
  });

  it('spawns next pipe only after spacing', () => {
    const near = running({ pipes: [{ x: C.width - C.pipeSpacing + 5, gapY: 10, passed: false }] });
    expect(e.step(near, 16, false, C, rng).pipes).toHaveLength(1);
    const far = running({ pipes: [{ x: C.width - C.pipeSpacing, gapY: 10, passed: false }] });
    expect(e.step(far, 16, false, C, rng).pipes).toHaveLength(2);
  });

  it('removes pipes left of the screen', () => {
    const s = running({ pipes: [{ x: -C.pipeWidth - 0.1, gapY: 10, passed: true }] });
    expect(e.step(s, 16, false, C, rng).pipes.every((p) => p.x > -C.pipeWidth)).toBe(true);
  });

  it('scores once when a pipe is passed', () => {
    const y = 16;
    const p = { x: C.birdX - C.pipeWidth + 0.01, gapY: 10, passed: false };
    let s = running({ birdY: y, pipes: [p] });
    s = e.step(s, 50, false, C, rng);
    expect(s.status).toBe('running');
    expect(s.score).toBe(1);
    expect(s.pipes[0]!.passed).toBe(true);
    s = e.step({ ...s, birdVy: 0, birdY: y }, 10, false, C, rng);
    expect(s.score).toBe(1);
  });

  it('collides with pipe', () => {
    const s = running({ birdY: 5, pipes: [{ x: C.birdX, gapY: 20, passed: false }] });
    expect(e.step(s, 16, false, C, rng).status).toBe('over');
  });

  it('passes through the gap', () => {
    const s = running({ birdY: 24, pipes: [{ x: C.birdX, gapY: 20, passed: false }] });
    expect(e.step(s, 16, false, C, rng).status).toBe('running');
  });

  it('collides with ground', () => {
    const s = running({ birdY: C.height - C.groundHeight - C.birdSize, birdVy: 100 });
    expect(e.step(s, 16, false, C, rng).status).toBe('over');
  });

  it('collides with ceiling', () => {
    const s = running({ birdY: 0.1, birdVy: -200 });
    expect(e.step(s, 16, false, C, rng).status).toBe('over');
  });

  it('keeps over state unchanged', () => {
    const s = running({ status: 'over' });
    expect(e.step(s, 16, true, C, rng)).toBe(s);
  });

  it('clamps dt to MAX_STEP_MS', () => {
    const a = e.step(running(), 10000, false, C, rng);
    const b = e.step(running(), MAX_STEP_MS, false, C, rng);
    expect(a).toEqual(b);
  });

  it.each([NaN, Infinity, -Infinity, -16])('treats invalid dt %s like 0', (dt) => {
    const s0 = running({ birdVy: 20, pipes: [{ x: 60, gapY: 10, passed: false }] });
    const a = e.step(s0, dt, false, C, rng);
    const b = e.step(s0, 0, false, C, rng);
    expect(a).toEqual(b);
    expect(a.birdY).toBe(s0.birdY);
    expect(a.birdVy).toBe(20);
    expect(a.pipes[0]!.x).toBe(60);
  });

  it('is deterministic for a fixed rng', () => {
    const run = () => {
      let s = e.create(C);
      for (let i = 0; i < 100; i++) s = e.step(s, 16, i % 20 === 0, C, rng);
      return s;
    };
    expect(run()).toEqual(run());
  });

  it('is playable with ~2.5 taps/s', () => {
    // Simple autopilot: tap when bird is below the gap center, at most every 250 ms.
    let s = e.create(C);
    let since = 1000;
    for (let i = 0; i < 60 * 30 && s.status !== 'over'; i++) {
      const next = s.pipes.find((p) => p.x + C.pipeWidth >= C.birdX);
      const target = next ? next.gapY + C.pipeGap / 2 : (C.height - C.groundHeight) / 2;
      const tap = s.birdY + C.birdSize / 2 > target + 3 && since >= 250;
      since = tap ? 0 : since + 16;
      s = e.step(s, 16, tap || s.status === 'ready', C, rng);
    }
    expect(s.status).toBe('running');
    expect(s.score).toBeGreaterThan(5);
  });
});
