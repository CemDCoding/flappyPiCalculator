export const MAX_STEP_MS = 50;

export interface GameConfig {
  width: number;
  height: number;
  /** px/s² */
  gravity: number;
  /** px/s, negativ = hoch */
  flapVelocity: number;
  /** px/s */
  pipeSpeed: number;
  pipeGap: number;
  pipeWidth: number;
  pipeSpacing: number;
  birdX: number;
  birdSize: number;
  groundHeight: number;
}

export interface Pipe {
  x: number;
  /** Oberkante der Lücke. */
  gapY: number;
  passed: boolean;
}

export type GameStatus = 'ready' | 'running' | 'over';

export interface GameState {
  status: GameStatus;
  birdY: number;
  birdVy: number;
  pipes: Pipe[];
  score: number;
}

/** Liefert Zahlen in [0,1). */
export type Rng = () => number;

export interface GameEngine {
  create(config: GameConfig): GameState;
  step(state: GameState, dtMs: number, flap: boolean, config: GameConfig, rng: Rng): GameState;
}

export type GameRenderer = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  config: GameConfig,
) => void;
