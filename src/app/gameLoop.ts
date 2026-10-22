import type { Scheduler } from '../contracts/app';

export interface GameLoop {
  start(): void;
  /** Cancels the pending frame; no further callbacks after this. */
  stop(): void;
  isRunning(): boolean;
}

/** Frame loop on top of an injectable Scheduler. At most one pending frame. */
export function createGameLoop(scheduler: Scheduler, onFrame: (timeMs: number) => void): GameLoop {
  let id: number | null = null;
  let running = false;

  const tick = (timeMs: number): void => {
    id = null;
    if (!running) return;
    onFrame(timeMs);
    if (running && id === null) id = scheduler.request(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      id = scheduler.request(tick);
    },
    stop() {
      running = false;
      if (id !== null) {
        scheduler.cancel(id);
        id = null;
      }
    },
    isRunning: () => running,
  };
}

/** Browser scheduler (requestAnimationFrame), fallback to timers outside the browser. */
export function defaultScheduler(): Scheduler {
  const g = globalThis as Partial<typeof globalThis>;
  const raf = g.requestAnimationFrame;
  const caf = g.cancelAnimationFrame;
  if (typeof raf === 'function' && typeof caf === 'function') {
    return {
      request: (cb) => raf.call(globalThis, cb),
      cancel: (id) => caf.call(globalThis, id),
    };
  }
  return {
    request: (cb) => Number(setTimeout(() => cb(Date.now()), 16)),
    cancel: (id) => clearTimeout(id),
  };
}
