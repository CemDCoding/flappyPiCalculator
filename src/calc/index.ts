import type { CalcEngine } from '../contracts/calc';
import { initialState, press } from './engine';
import { format } from './format';
import { evaluate } from './parser';

/** DOM-freier Rechenkern: Tasteneingabe → Zustand, sicherer Parser, deutsche Formatierung. */
export const calcEngine: CalcEngine = {
  initialState,
  press,
  evaluate,
  format,
};

export { initialState, press, toDisplay } from './engine';
export { evaluate } from './parser';
export { format } from './format';
export { tokenize } from './tokenizer';
