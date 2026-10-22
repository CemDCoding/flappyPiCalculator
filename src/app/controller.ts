import type { CalcEngine, CalcState } from '../contracts/calc';
import type { CalculatorView } from '../contracts/ui';

export interface AppDeps {
  view: CalculatorView;
  calc: CalcEngine;
}

export interface App {
  /** Meldet den Tastatur-Handler ab. */
  destroy(): void;
}

/** Verdrahtet Tasten, Rechenkern und Display. Abhängigkeiten per Parameter (AP-08 erweitert). */
export function createApp({ view, calc }: AppDeps): App {
  let state: CalcState = calc.initialState();

  const render = (): void => {
    view.display.showText(state.display, state.justEvaluated ? '=' : '');
  };

  const off = view.keypad.onKey((key) => {
    // Spielmodus (BIRD) folgt in AP-08; in M1 ignoriert.
    if (key === 'BIRD') return;
    state = calc.press(state, key);
    render();
  });

  render();

  return { destroy: off };
}
