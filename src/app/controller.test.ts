import { describe, expect, it } from 'vitest';
import { calcEngine } from '../calc';
import type { Key } from '../contracts/keys';
import type { CalculatorView } from '../contracts/ui';
import { createApp } from './controller';

function fakeView() {
  const shown: Array<[string, string | undefined]> = [];
  let handler: ((k: Key) => void) | null = null;
  const view: CalculatorView = {
    display: {
      showText: (m, s) => void shown.push([m, s]),
      showLines: () => {},
      showCanvas: () => null,
      hideCanvas: () => {},
    },
    keypad: {
      onKey(h) {
        handler = h;
        return () => {
          handler = null;
        };
      },
    },
  };
  return {
    view,
    shown,
    press: (...keys: Key[]) => keys.forEach((k) => handler?.(k)),
    hasHandler: () => handler !== null,
  };
}

describe('createApp', () => {
  it('shows initial state 0', () => {
    const f = fakeView();
    createApp({ view: f.view, calc: calcEngine });
    expect(f.shown.at(-1)?.[0]).toBe('0');
  });

  it('computes 2 + 3 * 4 = 14', () => {
    const f = fakeView();
    createApp({ view: f.view, calc: calcEngine });
    f.press('2', '+', '3', '*', '4', '=');
    expect(f.shown.at(-1)).toEqual(['14', '=']);
  });

  it('ignores BIRD', () => {
    const f = fakeView();
    createApp({ view: f.view, calc: calcEngine });
    f.press('7');
    const n = f.shown.length;
    f.press('BIRD');
    expect(f.shown.length).toBe(n);
    expect(f.shown.at(-1)?.[0]).toBe('7');
  });

  it('destroy unregisters the handler', () => {
    const f = fakeView();
    const app = createApp({ view: f.view, calc: calcEngine });
    app.destroy();
    expect(f.hasHandler()).toBe(false);
  });
});
