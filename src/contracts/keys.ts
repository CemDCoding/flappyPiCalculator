export const KEYS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  '+',
  '-',
  '*',
  '/',
  '(',
  ')',
  '%',
  '±',
  '=',
  'AC',
  'C',
  'BACK',
  'BIRD',
] as const;

export type Key = (typeof KEYS)[number];

export type DigitKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type CalcKey = Exclude<Key, 'BIRD'>;

export function isDigitKey(k: Key): k is DigitKey {
  return k.length === 1 && k >= '0' && k <= '9';
}
