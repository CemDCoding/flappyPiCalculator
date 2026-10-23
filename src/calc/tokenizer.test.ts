import { describe, expect, it } from 'vitest';
import { tokenize } from './tokenizer';

describe('tokenize', () => {
  it('splits numbers, operators, parens and percent', () => {
    expect(tokenize('(1.5+2)*3%')).toEqual({
      ok: true,
      tokens: [
        { type: 'lparen' },
        { type: 'number', value: 1.5 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 2 },
        { type: 'rparen' },
        { type: 'operator', value: '*' },
        { type: 'number', value: 3 },
        { type: 'percent' },
      ],
    });
  });

  it('accepts trailing and leading dots and exponents', () => {
    expect(tokenize('2.')).toEqual({ ok: true, tokens: [{ type: 'number', value: 2 }] });
    expect(tokenize('.5')).toEqual({ ok: true, tokens: [{ type: 'number', value: 0.5 }] });
    expect(tokenize('1.5e+15')).toEqual({ ok: true, tokens: [{ type: 'number', value: 1.5e15 }] });
    expect(tokenize('1e-10')).toEqual({ ok: true, tokens: [{ type: 'number', value: 1e-10 }] });
  });

  it('returns an empty token list for empty input', () => {
    expect(tokenize('')).toEqual({ ok: true, tokens: [] });
  });

  it.each(['1.2.3', '.', '2^3', 'a', '1 + 2', 'alert(1)', '1e', '1e+', '2,5', 'e5'])(
    'rejects %s',
    (input) => {
      expect(tokenize(input)).toEqual({ ok: false });
    },
  );
});
