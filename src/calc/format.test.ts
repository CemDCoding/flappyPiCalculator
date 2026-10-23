import { describe, expect, it } from 'vitest';
import { format } from './format';

describe('format', () => {
  it.each([
    [14, '14'],
    [0.1 + 0.2, '0,3'],
    [2.5, '2,5'],
    [1 / 3, '0,333333333333'],
    [2 / 3, '0,666666666667'],
    [-7, '-7'],
    [-0, '0'],
    [0, '0'],
    [1234567, '1234567'],
    [999999999999, '999999999999'],
    [999999999999.9, '1e+12'],
    [1e12, '1e+12'],
    [1.5e15, '1,5e+15'],
    [-1.5e15, '-1,5e+15'],
    [1e-9, '0,000000001'],
    [1.23e-7, '0,000000123'],
    [1.5e-10, '1,5e-10'],
    [-1.5e-10, '-1,5e-10'],
    [0.000001, '0,000001'],
    [123.456, '123,456'],
  ])('%d → %s', (value, expected) => {
    expect(format(value)).toBe(expected);
  });

  it('never uses a thousands separator', () => {
    expect(format(1000000)).toBe('1000000');
  });

  it('returns Error for non-finite values', () => {
    expect(format(Infinity)).toBe('Error');
    expect(format(NaN)).toBe('Error');
  });
});
