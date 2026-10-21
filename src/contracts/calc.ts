import type { CalcKey } from './keys';

export const MAX_EXPRESSION_LENGTH = 64;

export interface CalcState {
  /** Intern ASCII, `.` als Dezimaltrenner. */
  expression: string;
  /** Fertig formatiert für die Anzeige. */
  display: string;
  error: boolean;
  justEvaluated: boolean;
}

export type CalcResult = { ok: true; value: number } | { ok: false; error: 'Error' };

export interface CalcEngine {
  initialState(): CalcState;
  press(state: CalcState, key: CalcKey): CalcState;
  evaluate(expression: string): CalcResult;
  format(value: number): string;
}
