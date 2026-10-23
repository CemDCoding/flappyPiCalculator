import { describe, expect, it } from 'vitest';
import { MAX_EXPRESSION_LENGTH, type CalcState } from '../contracts/calc';
import type { CalcKey } from '../contracts/keys';
import { calcEngine } from './index';

const { initialState, press } = calcEngine;

/** Zerlegt eine Tastenfolge wie `2+3*4=` bzw. `[AC]` in Tasten. */
function keys(seq: string): CalcKey[] {
  const out: CalcKey[] = [];
  const re = /\[(AC|C|BACK)\]|./gu;
  for (const m of seq.matchAll(re)) out.push((m[1] ?? m[0]) as CalcKey);
  return out;
}

function run(seq: string, start: CalcState = initialState()): CalcState {
  return keys(seq).reduce((s, k) => press(s, k), start);
}

const display = (seq: string) => run(seq).display;

describe('initialState', () => {
  it('shows 0', () => {
    expect(initialState()).toEqual({
      expression: '',
      display: '0',
      error: false,
      justEvaluated: false,
    });
  });
});

describe('press – Abnahme- und Smoke-Beispiele', () => {
  it.each([
    ['2+3*4=', '14'],
    ['(2+3)*4=', '20'],
    ['50%=', '0,5'],
    ['0.1+0.2=', '0,3'],
    ['7±', '−7'],
    ['5/0=', 'Error'],
    ['5/0=[AC]', '0'],
    ['-3+5=', '2'],
    ['2*-3=', '−6'],
    ['((2))=', '2'],
    ['(1+2=', '3'],
    ['10/4=', '2,5'],
    ['1/3=', '0,333333333333'],
  ])('%s → %s', (seq, expected) => {
    expect(display(seq)).toBe(expected);
  });

  it('shows the expression with display symbols', () => {
    expect(display('12.5*3/2-1')).toBe('12,5×3÷2−1');
    expect(display('50%')).toBe('50%');
  });
});

describe('press – Eingabe', () => {
  it('dot only once per number and 0. at number start', () => {
    expect(display('.')).toBe('0,');
    expect(display('1.2.3')).toBe('1,23');
    expect(display('1+.5')).toBe('1+0,5');
    expect(display('1.5+2.5')).toBe('1,5+2,5');
  });

  it('replaces a single leading zero', () => {
    expect(display('007')).toBe('7');
    expect(display('10+05')).toBe('10+5');
    expect(display('0.05')).toBe('0,05');
  });

  it('operator after operator replaces the previous one', () => {
    expect(display('2+*3')).toBe('2×3');
    expect(display('2*+')).toBe('2+');
    expect(display('2+-')).toBe('2−');
    expect(display('2-+')).toBe('2+');
  });

  it('allows unary minus after *, /, ( and at the start', () => {
    expect(display('-')).toBe('−');
    expect(display('2*-')).toBe('2×−');
    expect(display('2/-')).toBe('2÷−');
    expect(display('(-')).toBe('(−');
    expect(display('2*--')).toBe('2×−');
    expect(display('2*-+')).toBe('2+');
    expect(display('-*')).toBe('−');
  });

  it('ignores operators without a left operand', () => {
    expect(display('+')).toBe('0');
    expect(display('*')).toBe('0');
    expect(display('(*')).toBe('(');
  });

  it('inserts implicit * before ( after a number, ) or %', () => {
    expect(display('2(')).toBe('2×(');
    expect(display('(2)(')).toBe('(2)×(');
    expect(display('50%(')).toBe('50%×(');
    expect(run('2(3=').display).toBe('6');
  });

  it('accepts ) only with an open ( and a value before', () => {
    expect(display(')')).toBe('0');
    expect(display('(2+)')).toBe('(2+');
    expect(display('(2))')).toBe('(2)');
  });

  it('ignores keys beyond MAX_EXPRESSION_LENGTH', () => {
    const s = run('1'.repeat(MAX_EXPRESSION_LENGTH + 10));
    expect(s.expression).toHaveLength(MAX_EXPRESSION_LENGTH);
    expect(press(s, '+').expression).toHaveLength(MAX_EXPRESSION_LENGTH);
    expect(press(s, '±').expression).toHaveLength(MAX_EXPRESSION_LENGTH);
  });
});

describe('press – ±', () => {
  it('toggles the sign of the last number', () => {
    expect(display('7±±')).toBe('7');
    expect(display('2*3±')).toBe('2×−3');
    expect(display('2*3±±')).toBe('2×3');
    expect(display('5-3±')).toBe('5−−3');
    expect(run('5-3±=').display).toBe('8');
    expect(display('50%±')).toBe('−50%');
  });

  it('is ignored without a number', () => {
    expect(display('±')).toBe('0');
    expect(display('2+±')).toBe('2+');
  });

  it('toggles a result and keeps justEvaluated', () => {
    const s = run('2+5=±');
    expect(s.display).toBe('−7');
    expect(s.justEvaluated).toBe(true);
  });
});

describe('press – = und Ergebnis', () => {
  it('stores the result as ASCII expression', () => {
    const s = run('10/4=');
    expect(s).toEqual({ expression: '2.5', display: '2,5', error: false, justEvaluated: true });
  });

  it('digit or dot after a result starts a new expression', () => {
    expect(display('2+3=7')).toBe('7');
    expect(display('2+3=.')).toBe('0,');
    expect(display('2+3=(')).toBe('(');
  });

  it('operator after a result continues with the result', () => {
    expect(display('2+3=*2')).toBe('5×2');
    expect(display('2+3=*2=')).toBe('10');
    expect(display('50=%=')).toBe('0,5');
  });

  it('handles exponent results', () => {
    const s = run('1000000*1000000*1500=');
    expect(s.expression).toBe('1.5e+15');
    expect(s.display).toBe('1,5e+15');
    expect(run('*2=', s).display).toBe('3e+15');
    expect(run('±', s).display).toBe('−1,5e+15');
    expect(run('*2[BACK]', s).display).toBe('1,5e+15×');
    expect(run('*2[BACK][BACK][BACK]', s).display).toBe('0');
  });

  it('= on empty or repeated is harmless', () => {
    expect(display('=')).toBe('0');
    expect(display('2+3==')).toBe('5');
  });

  it('incomplete expressions give Error', () => {
    const s = run('2+=');
    expect(s.error).toBe(true);
    expect(s.display).toBe('Error');
  });
});

describe('press – Löschen', () => {
  it('BACK removes the last character', () => {
    expect(display('123[BACK]')).toBe('12');
    expect(display('1[BACK]')).toBe('0');
    expect(display('[BACK]')).toBe('0');
    expect(display('2+[BACK]')).toBe('2');
  });

  it('C removes the last number (clear entry)', () => {
    expect(display('12+34[C]')).toBe('12+');
    expect(display('2*-3[C]')).toBe('2×');
    expect(display('50%[C]')).toBe('0');
    expect(display('2+[C]')).toBe('2+');
    expect(display('2+3=[C]')).toBe('0');
  });

  it('AC resets everything', () => {
    expect(run('12+34[AC]')).toEqual(initialState());
  });
});

describe('press – Fehlerzustand', () => {
  const err = () => run('5/0=');

  it('AC and C reset to the initial state', () => {
    expect(press(err(), 'AC')).toEqual(initialState());
    expect(press(err(), 'C')).toEqual(initialState());
  });

  it('digit or ( starts a new expression', () => {
    expect(press(err(), '7')).toEqual({
      expression: '7',
      display: '7',
      error: false,
      justEvaluated: false,
    });
    expect(press(err(), '(').display).toBe('(');
  });

  it.each(['.', '+', '-', '*', '/', ')', '%', '±', '=', 'BACK'] as CalcKey[])('ignores %s', (k) => {
    expect(press(err(), k)).toEqual(err());
  });
});

describe('press – Unveränderlichkeit', () => {
  it('never mutates the state and returns a new object', () => {
    const all: CalcKey[] = keys('0123456789.+-*/()%±=[AC][C][BACK]');
    const states = [initialState(), run('2+3'), run('2+3='), run('5/0='), run('(2*-3')];
    for (const s of states) {
      const frozen = Object.freeze({ ...s });
      for (const k of all) {
        const next = press(frozen, k);
        expect(next).not.toBe(frozen);
      }
    }
  });
});
