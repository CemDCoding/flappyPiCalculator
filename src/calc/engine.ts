import { MAX_EXPRESSION_LENGTH, type CalcState } from '../contracts/calc';
import type { CalcKey } from '../contracts/keys';
import { format } from './format';
import { evaluate } from './parser';

type Op = '+' | '-' | '*' | '/';

const isOp = (c: string | undefined): c is Op => c === '+' || c === '-' || c === '*' || c === '/';
const isDigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';
/** Zeichen, nach denen ein Wert (Operand) endet. */
const endsValue = (c: string | undefined): boolean =>
  isDigit(c) || c === '.' || c === ')' || c === '%';

/** Letzte Zahl (inkl. Exponent) und folgende `%` am Ende des Ausdrucks. */
const TRAILING_ENTRY = /(\d+(?:\.\d*)?(?:e[+-]?\d+)?)(%*)$/;

/**
 * Darstellung eines ASCII-Ausdrucks für das Display: `×`, `÷`, `−`,
 * Dezimalkomma; leerer Ausdruck → `0`. Vorzeichen im Exponenten bleiben ASCII.
 */
export function toDisplay(expression: string): string {
  if (expression === '') return '0';
  let out = '';
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i] as string;
    const prev = expression[i - 1];
    if (c === '*') out += '×';
    else if (c === '/') out += '÷';
    else if (c === '-') out += prev === 'e' ? '-' : '−';
    else if (c === '.') out += ',';
    else out += c;
  }
  return out;
}

/** Erzeugt einen neuen (nicht fehlerhaften) Zustand aus einem Ausdruck. */
function fromExpression(expression: string, justEvaluated = false): CalcState {
  return { expression, display: toDisplay(expression), error: false, justEvaluated };
}

/** Liefert den Anfangszustand: leerer Ausdruck, Anzeige `0`. */
export function initialState(): CalcState {
  return fromExpression('');
}

const copy = (s: CalcState): CalcState => ({ ...s });

/** Ersetzt den Ausdruck, sofern das Längenlimit eingehalten wird; sonst unverändert. */
function withExpression(state: CalcState, expression: string): CalcState {
  if (expression.length > MAX_EXPRESSION_LENGTH) return copy(state);
  return fromExpression(expression);
}

/** Ist das `-` an Position `i` ein unäres Minus? */
function isUnaryMinusAt(expr: string, i: number): boolean {
  if (expr[i] !== '-') return false;
  const prev = expr[i - 1];
  return prev === undefined || prev === '(' || isOp(prev);
}

function openParens(expr: string): number {
  let n = 0;
  for (const c of expr) {
    if (c === '(') n++;
    else if (c === ')') n--;
  }
  return n;
}

function pressDigit(state: CalcState, digit: string): CalcState {
  if (state.error || state.justEvaluated) return withExpression(initialState(), digit);
  const expr = state.expression;
  const m = TRAILING_ENTRY.exec(expr);
  if (m && m[2] === '' && m[1] !== undefined) {
    const num = m[1];
    if (num.includes('e')) return copy(state); // Exponent-Ergebnis ist abgeschlossen
    if (num === '0') return withExpression(state, expr.slice(0, -1) + digit);
    return withExpression(state, expr + digit);
  }
  const last = expr[expr.length - 1];
  if (last === ')' || last === '%') return withExpression(state, expr + '*' + digit);
  return withExpression(state, expr + digit);
}

function pressDot(state: CalcState): CalcState {
  if (state.error) return copy(state);
  if (state.justEvaluated) return withExpression(initialState(), '0.');
  const expr = state.expression;
  const m = TRAILING_ENTRY.exec(expr);
  if (m && m[2] === '' && m[1] !== undefined) {
    if (m[1].includes('.') || m[1].includes('e')) return copy(state);
    return withExpression(state, expr + '.');
  }
  const last = expr[expr.length - 1];
  if (last === ')' || last === '%') return withExpression(state, expr + '*0.');
  return withExpression(state, expr + '0.');
}

function pressOperator(state: CalcState, op: Op): CalcState {
  if (state.error) return copy(state);
  const expr = state.expression;
  const last = expr[expr.length - 1];
  if (last === undefined || last === '(') {
    return op === '-' ? withExpression(state, expr + '-') : copy(state);
  }
  if (isOp(last)) {
    const i = expr.length - 1;
    if (isUnaryMinusAt(expr, i)) {
      if (op === '-') return copy(state);
      const before = expr[i - 1];
      // `2*-` + `+` → `2+`; am Anfang oder nach `(` ignorieren
      if (isOp(before)) return withExpression(state, expr.slice(0, -2) + op);
      return copy(state);
    }
    if (op === '-' && (last === '*' || last === '/')) return withExpression(state, expr + '-');
    return withExpression(state, expr.slice(0, -1) + op);
  }
  return withExpression(state, expr + op);
}

function pressOpenParen(state: CalcState): CalcState {
  if (state.error || state.justEvaluated) return withExpression(initialState(), '(');
  const expr = state.expression;
  const last = expr[expr.length - 1];
  return withExpression(state, expr + (endsValue(last) ? '*(' : '('));
}

function pressCloseParen(state: CalcState): CalcState {
  if (state.error || state.justEvaluated) return copy(state);
  const expr = state.expression;
  if (openParens(expr) <= 0 || !endsValue(expr[expr.length - 1])) return copy(state);
  return withExpression(state, expr + ')');
}

function pressPercent(state: CalcState): CalcState {
  if (state.error) return copy(state);
  const expr = state.expression;
  const last = expr[expr.length - 1];
  if (isDigit(last) || last === '.' || last === ')') return withExpression(state, expr + '%');
  return copy(state);
}

function pressToggleSign(state: CalcState): CalcState {
  if (state.error) return copy(state);
  const expr = state.expression;
  const m = TRAILING_ENTRY.exec(expr);
  if (!m) return copy(state);
  const start = m.index;
  let next: string;
  if (start > 0 && isUnaryMinusAt(expr, start - 1)) {
    next = expr.slice(0, start - 1) + expr.slice(start);
  } else {
    next = expr.slice(0, start) + '-' + expr.slice(start);
  }
  if (next.length > MAX_EXPRESSION_LENGTH) return copy(state);
  return fromExpression(next, state.justEvaluated);
}

function pressEquals(state: CalcState): CalcState {
  if (state.error || state.justEvaluated || state.expression === '') return copy(state);
  const result = evaluate(state.expression);
  if (!result.ok) {
    return { expression: '', display: 'Error', error: true, justEvaluated: false };
  }
  const ascii = format(result.value).replace(',', '.');
  return fromExpression(ascii, true);
}

function pressBack(state: CalcState): CalcState {
  if (state.error) return copy(state);
  const expr = state.expression;
  const m = TRAILING_ENTRY.exec(expr);
  if (m && m[2] === '' && m[1]?.includes('e')) {
    return fromExpression(expr.slice(0, m.index));
  }
  return fromExpression(expr.slice(0, -1));
}

function pressClearEntry(state: CalcState): CalcState {
  if (state.error || state.justEvaluated) return initialState();
  const expr = state.expression;
  const m = TRAILING_ENTRY.exec(expr);
  if (!m) return copy(state);
  let start = m.index;
  if (start > 0 && isUnaryMinusAt(expr, start - 1)) start--;
  return fromExpression(expr.slice(0, start));
}

/**
 * Verarbeitet eine Rechnertaste und liefert einen **neuen** Zustand
 * (der übergebene Zustand wird nie verändert).
 */
export function press(state: CalcState, key: CalcKey): CalcState {
  switch (key) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return pressDigit(state, key);
    case '.':
      return pressDot(state);
    case '+':
    case '-':
    case '*':
    case '/':
      return pressOperator(state, key);
    case '(':
      return pressOpenParen(state);
    case ')':
      return pressCloseParen(state);
    case '%':
      return pressPercent(state);
    case '±':
      return pressToggleSign(state);
    case '=':
      return pressEquals(state);
    case 'BACK':
      return pressBack(state);
    case 'C':
      return pressClearEntry(state);
    case 'AC':
      return initialState();
    default: {
      const unreachable: never = key;
      return unreachable;
    }
  }
}
