import { MAX_STEP_MS } from '../contracts/game';
import type { GameConfig, GameEngine, GameState, Pipe, Rng } from '../contracts/game';

const GAP_MARGIN = 4;

function startY(config: GameConfig): number {
  return (config.height - config.groundHeight - config.birdSize) / 2;
}

function create(config: GameConfig): GameState {
  return { status: 'ready', birdY: startY(config), birdVy: 0, pipes: [], score: 0 };
}

function collides(birdY: number, pipes: Pipe[], config: GameConfig): boolean {
  const { birdX, birdSize, pipeWidth, pipeGap, height, groundHeight } = config;
  if (birdY < 0 || birdY + birdSize > height - groundHeight) return true;
  return pipes.some(
    (p) =>
      birdX + birdSize > p.x &&
      birdX < p.x + pipeWidth &&
      (birdY < p.gapY || birdY + birdSize > p.gapY + pipeGap),
  );
}

function step(
  state: GameState,
  dtMs: number,
  flap: boolean,
  config: GameConfig,
  rng: Rng,
): GameState {
  if (state.status === 'over') return state;
  if (state.status === 'ready' && !flap) return state;

  // NaN, ±Infinity and negative values count as 0 (no movement).
  const dt = Number.isFinite(dtMs) ? Math.max(0, Math.min(dtMs, MAX_STEP_MS)) / 1000 : 0;
  let vy = flap ? config.flapVelocity : state.birdVy;
  vy += config.gravity * dt;
  const birdY = state.birdY + vy * dt;

  let score = state.score;
  const pipes: Pipe[] = [];
  for (const p of state.pipes) {
    const x = p.x - config.pipeSpeed * dt;
    if (x + config.pipeWidth < 0) continue;
    let passed = p.passed;
    if (!passed && x + config.pipeWidth < config.birdX) {
      passed = true;
      score += 1;
    }
    pipes.push({ x, gapY: p.gapY, passed });
  }

  const last = pipes[pipes.length - 1];
  if (!last || last.x <= config.width - config.pipeSpacing) {
    const min = GAP_MARGIN;
    const max = config.height - config.groundHeight - GAP_MARGIN - config.pipeGap;
    pipes.push({ x: config.width, gapY: min + rng() * Math.max(0, max - min), passed: false });
  }

  const status = collides(birdY, pipes, config) ? 'over' : 'running';
  return { status, birdY, birdVy: vy, pipes, score };
}

export const gameEngine: GameEngine = { create, step };
