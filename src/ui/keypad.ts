import type { Key } from '../contracts/keys';

interface KeyDef {
  label: string;
  key: Key;
  aria: string;
  kind: 'digit' | 'op' | 'fn' | 'eq' | 'bird';
}

const d = (n: string): KeyDef => ({ label: n, key: n as Key, aria: n, kind: 'digit' });
const op = (label: string, key: Key, aria: string): KeyDef => ({ label, key, aria, kind: 'op' });
const fn = (label: string, key: Key, aria: string): KeyDef => ({ label, key, aria, kind: 'fn' });

/** 4 columns x 6 rows. */
export const KEY_LAYOUT: readonly KeyDef[] = [
  fn('AC', 'AC', 'Alles löschen'),
  fn('C', 'C', 'Eingabe löschen'),
  fn('⌫', 'BACK', 'Zeichen löschen'),
  { label: '🐦', key: 'BIRD', aria: 'Spiel', kind: 'bird' },
  op('(', '(', 'Klammer auf'),
  op(')', ')', 'Klammer zu'),
  op('%', '%', 'Prozent'),
  op('÷', '/', 'Geteilt'),
  d('7'),
  d('8'),
  d('9'),
  op('×', '*', 'Mal'),
  d('4'),
  d('5'),
  d('6'),
  op('−', '-', 'Minus'),
  d('1'),
  d('2'),
  d('3'),
  op('+', '+', 'Plus'),
  fn('±', '±', 'Vorzeichen wechseln'),
  d('0'),
  { label: ',', key: '.', aria: 'Komma', kind: 'digit' },
  { label: '=', key: '=', aria: 'Ergebnis', kind: 'eq' },
];

export function createKeypad(onPress: (key: Key) => void): {
  element: HTMLElement;
  buttons: Map<Key, HTMLButtonElement>;
} {
  const element = document.createElement('div');
  element.className = 'keypad';
  const buttons = new Map<Key, HTMLButtonElement>();
  for (const def of KEY_LAYOUT) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `key key-${def.kind}`;
    b.dataset.key = def.key;
    b.setAttribute('aria-label', def.aria);
    b.textContent = def.label;
    b.addEventListener('click', () => onPress(def.key));
    buttons.set(def.key, b);
    element.append(b);
  }
  return { element, buttons };
}
