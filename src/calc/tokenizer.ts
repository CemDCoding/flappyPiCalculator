/** Binäre Rechenoperatoren (`-` kann im Parser auch unär sein). */
export type Operator = '+' | '-' | '*' | '/';

export type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: Operator }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'percent' };

export type TokenizeResult = { ok: true; tokens: Token[] } | { ok: false };

const isDigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';

/**
 * Zerlegt einen ASCII-Ausdruck in Tokens.
 *
 * Erlaubt sind Zahlen (Ziffern mit höchstens einem `.`, optional mit
 * Exponent wie `1.5e+15`), die Operatoren `+ - * /`, Klammern und `%`.
 * Jedes andere Zeichen (auch Leerzeichen) führt zu `{ ok: false }`.
 */
export function tokenize(input: string): TokenizeResult {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i] as string;
    if (isDigit(c) || c === '.') {
      const start = i;
      let digits = 0;
      let dots = 0;
      while (i < input.length && (isDigit(input[i]) || input[i] === '.')) {
        if (input[i] === '.') dots++;
        else digits++;
        i++;
      }
      if (dots > 1 || digits === 0) return { ok: false };
      if (input[i] === 'e') {
        i++;
        if (input[i] === '+' || input[i] === '-') i++;
        if (!isDigit(input[i])) return { ok: false };
        while (isDigit(input[i])) i++;
      }
      const value = Number(input.slice(start, i));
      if (Number.isNaN(value)) return { ok: false };
      tokens.push({ type: 'number', value });
      continue;
    }
    switch (c) {
      case '+':
      case '-':
      case '*':
      case '/':
        tokens.push({ type: 'operator', value: c });
        break;
      case '(':
        tokens.push({ type: 'lparen' });
        break;
      case ')':
        tokens.push({ type: 'rparen' });
        break;
      case '%':
        tokens.push({ type: 'percent' });
        break;
      default:
        return { ok: false };
    }
    i++;
  }
  return { ok: true, tokens };
}
