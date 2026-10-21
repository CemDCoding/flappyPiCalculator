import { describe, expect, it } from 'vitest';
import {
  DISPLAY_CANVAS,
  INITIALS_PATTERN,
  KEYS,
  LEADERBOARD_KEY,
  MAX_ENTRIES,
  MAX_EXPRESSION_LENGTH,
  MAX_STEP_MS,
  isDigitKey,
} from './index';

describe('contracts', () => {
  it('KEYS has 24 unique entries', () => {
    expect(KEYS.length).toBe(24);
    expect(new Set(KEYS).size).toBe(24);
  });

  it('isDigitKey recognizes only digits', () => {
    for (const d of KEYS.slice(0, 10)) expect(isDigitKey(d)).toBe(true);
    for (const k of ['.', '+', 'AC', 'BIRD', '±'] as const) expect(isDigitKey(k)).toBe(false);
  });

  it('INITIALS_PATTERN accepts 1-6 digits only', () => {
    for (const ok of ['1', '123456', '007']) expect(INITIALS_PATTERN.test(ok)).toBe(true);
    for (const bad of ['', '1234567', 'a1', '1.5', '-1', ' 1']) {
      expect(INITIALS_PATTERN.test(bad)).toBe(false);
    }
  });

  it('constants have agreed values', () => {
    expect(MAX_EXPRESSION_LENGTH).toBe(64);
    expect(MAX_STEP_MS).toBe(50);
    expect(MAX_ENTRIES).toBe(3);
    expect(LEADERBOARD_KEY).toBe('mataschen.leaderboard.v1');
    expect(DISPLAY_CANVAS).toEqual({ width: 120, height: 48 });
  });
});
