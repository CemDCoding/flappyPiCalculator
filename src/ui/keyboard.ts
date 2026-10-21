import type { Key } from '../contracts/keys';

/*
 * Keyboard mapping (physical key -> calculator Key):
 *   0-9            -> '0'..'9'
 *   . and ,        -> '.'
 *   + - * /        -> '+' '-' '*' '/'
 *   ( )            -> '(' ')'
 *   %              -> '%'
 *   Enter and =    -> '='
 *   Backspace      -> 'BACK'
 *   Escape         -> 'AC'
 *   Delete         -> 'C'
 *   F9             -> '±'
 *   b / B          -> 'BIRD'
 */
const SPECIAL: Record<string, Key> = {
  ',': '.',
  Enter: '=',
  '=': '=',
  Backspace: 'BACK',
  Escape: 'AC',
  Delete: 'C',
  F9: '±',
  b: 'BIRD',
  B: 'BIRD',
};

const DIRECT = new Set<string>(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', '%']);

/** Maps a KeyboardEvent.key value to a calculator Key, or null if unmapped. */
export function mapKeyboardKey(eventKey: string): Key | null {
  if (DIRECT.has(eventKey)) return eventKey as Key;
  return SPECIAL[eventKey] ?? null;
}

/**
 * Listens for keydown on window. Returns a detach function.
 * preventDefault is only called for mapped keys (modifier combos are ignored).
 */
export function attachKeyboard(onKey: (key: Key) => void): () => void {
  const listener = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = mapKeyboardKey(e.key);
    if (key === null) return;
    e.preventDefault();
    onKey(key);
  };
  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
