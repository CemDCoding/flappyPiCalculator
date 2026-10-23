import type { GameConfig } from '../contracts/game';
import { DISPLAY_CANVAS } from '../contracts/ui';

/**
 * Default tuning for the 120x48 display (units: px, px/s, px/s^2).
 *
 * Playability reasoning (human taps about 2-3 times per second):
 * - gravity 300 and flapVelocity -75 give a hop of v^2/(2g) = ~9 px that
 *   peaks after 0.25 s. A tap every ~0.5 s keeps the bird level, faster
 *   taps climb, slower ones sink; so 2-3 taps/s gives full control over
 *   height without needing precise timing.
 * - pipeGap 22 vs. birdSize 8 leaves 14 px of slack (one hop is ~9 px).
 *   A test autopilot tapping at most every 250 ms clears 5+ pipes.
 * - pipeSpeed 40 with pipeSpacing 50 means a new pipe every 1.25 s, enough
 *   time to correct height between pipes.
 * - gap position keeps a 4 px margin to ceiling and ground (see engine).
 * - birdY is the top edge of the bird box.
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  width: DISPLAY_CANVAS.width,
  height: DISPLAY_CANVAS.height,
  gravity: 300,
  flapVelocity: -75,
  pipeSpeed: 40,
  pipeGap: 22,
  pipeWidth: 8,
  pipeSpacing: 50,
  birdX: 24,
  birdSize: 8,
  groundHeight: 2,
};
