import type { Key } from '../contracts/keys';
import type { CreateCalculatorView } from '../contracts/ui';
import './ui.css';
import { createDisplay } from './display';
import { attachKeyboard } from './keyboard';
import { createKeypad } from './keypad';

const HIGHLIGHT_MS = 120;

export const createCalculatorView: CreateCalculatorView = (root) => {
  const handlers = new Set<(key: Key) => void>();
  const timers = new Map<Key, ReturnType<typeof setTimeout>>();

  const emit = (key: Key): void => {
    for (const h of [...handlers]) h(key);
  };

  const body = document.createElement('div');
  body.className = 'calc';
  const display = createDisplay();
  const keypad = createKeypad(emit);
  body.append(display.element, keypad.element);
  root.append(body);

  const highlight = (key: Key): void => {
    const b = keypad.buttons.get(key);
    if (!b) return;
    b.classList.add('pressed');
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => b.classList.remove('pressed'), HIGHLIGHT_MS),
    );
  };

  let detachKeyboard: (() => void) | null = null;

  return {
    display: display.view,
    keypad: {
      onKey(handler) {
        handlers.add(handler);
        if (!detachKeyboard) {
          detachKeyboard = attachKeyboard((key) => {
            highlight(key);
            emit(key);
          });
        }
        return () => {
          handlers.delete(handler);
          if (handlers.size === 0 && detachKeyboard) {
            detachKeyboard();
            detachKeyboard = null;
          }
        };
      },
    },
  };
};
