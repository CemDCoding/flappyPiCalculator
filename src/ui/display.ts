import { DISPLAY_CANVAS, type DisplayView } from '../contracts/ui';

export interface DisplayElement {
  element: HTMLElement;
  view: DisplayView;
}

const MAX_LINES = 4;

export function createDisplay(): DisplayElement {
  const element = document.createElement('div');
  element.className = 'lcd';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');

  const text = document.createElement('div');
  text.className = 'lcd-text';
  const sub = document.createElement('div');
  sub.className = 'lcd-sub';
  const main = document.createElement('div');
  main.className = 'lcd-main';
  text.append(sub, main);

  const lines = document.createElement('div');
  lines.className = 'lcd-lines';
  lines.hidden = true;

  const canvas = document.createElement('canvas');
  canvas.className = 'lcd-canvas';
  canvas.width = DISPLAY_CANVAS.width;
  canvas.height = DISPLAY_CANVAS.height;
  canvas.hidden = true;

  element.append(text, lines, canvas);

  const showOnly = (which: 'text' | 'lines' | 'canvas'): void => {
    text.hidden = which !== 'text';
    lines.hidden = which !== 'lines';
    canvas.hidden = which !== 'canvas';
  };

  const view: DisplayView = {
    showText(m, s = '') {
      main.textContent = m;
      sub.textContent = s;
      showOnly('text');
    },
    showLines(l) {
      lines.replaceChildren();
      for (const line of l.slice(0, MAX_LINES)) {
        const row = document.createElement('div');
        row.className = 'lcd-line';
        row.textContent = line;
        lines.append(row);
      }
      showOnly('lines');
    },
    showCanvas() {
      showOnly('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.imageSmoothingEnabled = false;
      return ctx;
    },
    hideCanvas() {
      showOnly('text');
    },
  };

  return { element, view };
}
