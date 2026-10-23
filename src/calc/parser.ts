import type { CalcResult } from '../contracts/calc';
import { tokenize, type Token } from './tokenizer';

const ERROR: CalcResult = { ok: false, error: 'Error' };

class ParseError extends Error {}

/**
 * Rekursiver Abstieg über die Grammatik
 *
 * ```
 * expr    := term (('+' | '-') term)*
 * term    := unary (('*' | '/') unary)*
 * unary   := '-' unary | postfix
 * postfix := primary '%'*
 * primary := number | '(' expr [')']
 * ```
 *
 * Eine fehlende `)` ist nur am Ende der Eingabe erlaubt (automatisch ergänzt).
 */
class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    const value = this.expr();
    if (this.pos !== this.tokens.length) throw new ParseError('unexpected token');
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private expr(): number {
    let value = this.term();
    for (;;) {
      const t = this.peek();
      if (t?.type !== 'operator' || (t.value !== '+' && t.value !== '-')) return value;
      this.pos++;
      const rhs = this.term();
      value = t.value === '+' ? value + rhs : value - rhs;
    }
  }

  private term(): number {
    let value = this.unary();
    for (;;) {
      const t = this.peek();
      if (t?.type !== 'operator' || (t.value !== '*' && t.value !== '/')) return value;
      this.pos++;
      const rhs = this.unary();
      value = t.value === '*' ? value * rhs : value / rhs;
    }
  }

  private unary(): number {
    const t = this.peek();
    if (t?.type === 'operator' && t.value === '-') {
      this.pos++;
      return -this.unary();
    }
    return this.postfix();
  }

  private postfix(): number {
    let value = this.primary();
    while (this.peek()?.type === 'percent') {
      this.pos++;
      value = value / 100;
    }
    return value;
  }

  private primary(): number {
    const t = this.peek();
    if (t?.type === 'number') {
      this.pos++;
      return t.value;
    }
    if (t?.type === 'lparen') {
      this.pos++;
      const value = this.expr();
      const close = this.peek();
      if (close?.type === 'rparen') {
        this.pos++;
      } else if (close !== undefined) {
        throw new ParseError('expected )');
      }
      return value;
    }
    throw new ParseError('expected number or (');
  }
}

/**
 * Wertet einen ASCII-Ausdruck sicher aus (ohne `eval`/`Function`).
 *
 * Unterstützt Punkt-vor-Strich, Klammern, unäres Minus und Postfix-`%`
 * (Wert ÷ 100). Fehlende schließende Klammern am Ende werden ergänzt.
 * Syntaxfehler und nicht endliche Ergebnisse (z. B. ÷ 0) liefern
 * `{ ok: false, error: 'Error' }`.
 */
export function evaluate(expression: string): CalcResult {
  const tokenized = tokenize(expression);
  if (!tokenized.ok || tokenized.tokens.length === 0) return ERROR;
  let value: number;
  try {
    value = new Parser(tokenized.tokens).parse();
  } catch {
    // ParseError oder RangeError (zu tiefe Verschachtelung) → Error
    return ERROR;
  }
  if (!Number.isFinite(value)) return ERROR;
  return { ok: true, value };
}
