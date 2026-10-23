import type { Scheduler } from '../contracts/app';
import type { CalcEngine, CalcState } from '../contracts/calc';
import type { GameConfig, GameEngine, GameRenderer, GameState, Rng } from '../contracts/game';
import type { LeaderboardStore } from '../contracts/leaderboard';
import type { CalculatorView } from '../contracts/ui';
import { DEFAULT_GAME_CONFIG, gameEngine } from '../game';
import { renderGame } from '../game/render';
import { createLeaderboard, formatEntry } from '../leaderboard';
import { createGameLoop, defaultScheduler, nowMs } from './gameLoop';
import { createMemoryStorage } from './memoryStorage';
import {
  acHintLines,
  initialAppState,
  initialsLines,
  leaderboardLines,
  transition,
  type AppEvent,
  type AppState,
  type Effect,
} from './modes';

export interface AppDeps {
  view: CalculatorView;
  calc: CalcEngine;
  /** Defaults to an in-memory leaderboard. */
  leaderboard?: LeaderboardStore;
  game?: GameEngine;
  gameConfig?: GameConfig;
  render?: GameRenderer;
  scheduler?: Scheduler;
  /** Time source in ms, same timeline as the scheduler timestamps. */
  now?: () => number;
  rng?: Rng;
}

export interface App {
  /** Unregisters the key handler and stops the game loop. */
  destroy(): void;
}

/** Wires keys, calculator, game, leaderboard and display. Dependencies are injected. */
export function createApp(deps: AppDeps): App {
  const { view, calc } = deps;
  const store = deps.leaderboard ?? createLeaderboard(createMemoryStorage());
  const engine = deps.game ?? gameEngine;
  const config = deps.gameConfig ?? DEFAULT_GAME_CONFIG;
  const draw = deps.render ?? renderGame;
  const now = deps.now ?? nowMs;
  const rng = deps.rng ?? Math.random;
  const display = view.display;

  let calcState: CalcState = calc.initialState();
  let app: AppState = initialAppState();
  let game: GameState = engine.create(config);
  let ctx: CanvasRenderingContext2D | null = null;

  const renderCalc = (): void => {
    display.showText(calcState.display, calcState.justEvaluated ? '=' : '');
  };

  const drawGame = (): void => {
    if (ctx) draw(ctx, game, config);
  };

  const showLeaderboard = (): void => {
    display.showLines(leaderboardLines(store.load().map((e, i) => formatEntry(e, i + 1))));
  };

  const loop = createGameLoop(deps.scheduler ?? defaultScheduler(), (t) =>
    dispatch({ type: 'frame', now: t }),
  );

  function run(e: Effect): void {
    switch (e.type) {
      case 'calcKey':
        calcState = calc.press(calcState, e.key);
        renderCalc();
        return;
      case 'resetCalc':
        calcState = calc.initialState();
        return;
      case 'showCalc':
        renderCalc();
        return;
      case 'newGame':
        game = engine.create(config);
        ctx = display.showCanvas();
        drawGame();
        return;
      case 'resumeGame':
        ctx = display.showCanvas();
        drawGame();
        return;
      case 'step': {
        const wasOver = game.status === 'over';
        game = engine.step(game, e.dtMs, e.flap, config, rng);
        drawGame();
        if (!wasOver && game.status === 'over') {
          dispatch({
            type: 'gameOver',
            now: e.now,
            score: game.score,
            qualifies: store.qualifies(game.score),
          });
        }
        return;
      }
      case 'renderGame':
        drawGame();
        return;
      case 'startLoop':
        loop.start();
        return;
      case 'stopLoop':
        loop.stop();
        return;
      case 'hideCanvas':
        display.hideCanvas();
        ctx = null;
        return;
      case 'showInitials':
        display.showLines(initialsLines(e.score, e.initials));
        return;
      case 'saveScore':
        store.add(e.initials, e.score);
        return;
      case 'showLeaderboard':
        showLeaderboard();
        return;
      case 'showAcHint':
        display.showLines(acHintLines());
        return;
      case 'clearLeaderboard':
        store.clear();
        return;
    }
  }

  function dispatch(ev: AppEvent): void {
    const t = transition(app, ev);
    app = t.state;
    for (const e of t.effects) run(e);
  }

  const off = view.keypad.onKey((key) => dispatch({ type: 'key', key, now: now() }));

  renderCalc();

  return {
    destroy() {
      off();
      loop.stop();
    },
  };
}
