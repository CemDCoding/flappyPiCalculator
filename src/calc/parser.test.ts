import { describe, expect, it } from 'vitest';
import { evaluate } from './parser';

const ok = (value: number) => ({ ok: true, value });
const ERR = { ok: false, error: 'Error' };

describe('evaluate', () => {
  it.each([
    ['2+3*4', 14],
    ['(2+3)*4', 20],
    ['50%', 0.5],
    ['-3+5', 2],
    ['2*-3', -6],
    ['((2))', 2],
    ['(1+2', 3],
    ['((2+3', 5],
    ['2*(3+(4', 14],
    ['10/4', 2.5],
    ['8-2-1', 5],
    ['16/4/2', 2],
    ['-(2+3)', -5],
    ['--2', 2],
    ['5--3', 8],
    ['200*10%', 20],
    ['50%%', 0.005],
    ['(50)%', 0.5],
    ['-50%', -0.5],
    ['2.', 2],
    ['1.5e+15*2', 3e15],
  ])('%s = %d', (expr, value) => {
    expect(evaluate(expr)).toEqual(ok(value));
  });

  it('computes 0.1+0.2 close to 0.3', () => {
    const r = evaluate('0.1+0.2');
    expect(r.ok && Math.abs(r.value - 0.3) < 1e-12).toBe(true);
  });

  it.each([
    '5/0',
    '0/0',
    '',
    '+',
    '-',
    '2+',
    '*2',
    '()',
    '2)',
    '(2))',
    '2(3)',
    '(2)(3)',
    '1e308*10',
    'abc',
    '2+3;alert(1)',
    '%',
  ])('%s → Error', (expr) => {
    expect(evaluate(expr)).toEqual(ERR);
  });

  it('survives very deep nesting without throwing', () => {
    expect(() => evaluate('('.repeat(100000) + '1')).not.toThrow();
    expect(() => evaluate('-'.repeat(100000) + '1')).not.toThrow();
  });
});
