import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KEYS, type Key } from '../contracts/keys';
import { createCalculatorView } from './view';

const offs: (() => void)[] = [];
afterEach(() => {
  while (offs.length) offs.pop()!();
});

function setup() {
  document.body.replaceChildren();
  const root = document.createElement('div');
  document.body.append(root);
  const view = createCalculatorView(root);
  const got: Key[] = [];
  const off = view.keypad.onKey((k) => got.push(k));
  offs.push(off);
  return { root, view, got, off };
}

const press = (key: string) => {
  const e = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });
  window.dispatchEvent(e);
  return e;
};

describe('keypad clicks', () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it('has 24 labelled buttons covering every Key once', () => {
    const buttons = ctx.root.querySelectorAll<HTMLButtonElement>('button[data-key]');
    expect(buttons.length).toBe(24);
    expect([...buttons].map((b) => b.dataset.key).sort()).toEqual([...KEYS].sort());
    for (const b of buttons) {
      expect(b.type).toBe('button');
      expect(b.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('click emits the right key for each button', () => {
    for (const b of ctx.root.querySelectorAll<HTMLButtonElement>('button[data-key]')) {
      ctx.got.length = 0;
      b.click();
      expect(ctx.got).toEqual([b.dataset.key]);
    }
  });

  it('maps labels to keys', () => {
    const by = (label: string) =>
      [...ctx.root.querySelectorAll('button')].find((b) => b.textContent === label)!;
    expect(by(',').dataset.key).toBe('.');
    expect(by('×').dataset.key).toBe('*');
    expect(by('÷').dataset.key).toBe('/');
    expect(by('−').dataset.key).toBe('-');
    expect(by('⌫').dataset.key).toBe('BACK');
    expect(by('🐦').dataset.key).toBe('BIRD');
    expect(by('🐦').getAttribute('aria-label')).toBe('Spiel');
  });
});

describe('keyboard', () => {
  const cases: [string, Key][] = [
    ['0', '0'],
    ['9', '9'],
    ['.', '.'],
    [',', '.'],
    ['+', '+'],
    ['-', '-'],
    ['*', '*'],
    ['/', '/'],
    ['(', '('],
    [')', ')'],
    ['%', '%'],
    ['Enter', '='],
    ['=', '='],
    ['Backspace', 'BACK'],
    ['Escape', 'AC'],
    ['Delete', 'C'],
    ['F9', '±'],
    ['b', 'BIRD'],
  ];

  it.each(cases)('%s -> %s', (ev, key) => {
    const { got } = setup();
    const e = press(ev);
    expect(got).toEqual([key]);
    expect(e.defaultPrevented).toBe(true);
  });

  it('ignores unmapped keys without preventDefault', () => {
    const { got } = setup();
    const e = press('x');
    expect(got).toEqual([]);
    expect(e.defaultPrevented).toBe(false);
  });

  it('unsubscribe removes handler and keyboard listener', () => {
    const { got, off } = setup();
    off();
    const e = press('1');
    expect(got).toEqual([]);
    expect(e.defaultPrevented).toBe(false);
  });

  it('highlights pressed button briefly', () => {
    vi.useFakeTimers();
    const { root } = setup();
    press('7');
    const b = root.querySelector('button[data-key="7"]')!;
    expect(b.classList.contains('pressed')).toBe(true);
    vi.advanceTimersByTime(200);
    expect(b.classList.contains('pressed')).toBe(false);
    vi.useRealTimers();
  });
});

describe('display', () => {
  it('showText sets main and sub via textContent', () => {
    const { root, view } = setup();
    view.display.showText('<b>42</b>', '1+1');
    expect(root.querySelector('.lcd-main')!.textContent).toBe('<b>42</b>');
    expect(root.querySelector('.lcd-main')!.children.length).toBe(0);
    expect(root.querySelector('.lcd-sub')!.textContent).toBe('1+1');
    expect((root.querySelector('.lcd-text') as HTMLElement).hidden).toBe(false);
  });

  it('showLines shows at most 4 lines', () => {
    const { root, view } = setup();
    view.display.showLines(['a', 'b', 'c', 'd', 'e']);
    const rows = root.querySelectorAll('.lcd-line');
    expect([...rows].map((r) => r.textContent)).toEqual(['a', 'b', 'c', 'd']);
    expect((root.querySelector('.lcd-text') as HTMLElement).hidden).toBe(true);
    expect((root.querySelector('.lcd-lines') as HTMLElement).hidden).toBe(false);
  });

  it('showCanvas/hideCanvas toggle visibility (context may be null in jsdom)', () => {
    const { root, view } = setup();
    const canvas = root.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(120);
    expect(canvas.height).toBe(48);
    const ctx = view.display.showCanvas();
    expect(ctx === null || typeof ctx === 'object').toBe(true);
    expect(canvas.hidden).toBe(false);
    expect((root.querySelector('.lcd-text') as HTMLElement).hidden).toBe(true);
    view.display.hideCanvas();
    expect(canvas.hidden).toBe(true);
    expect((root.querySelector('.lcd-text') as HTMLElement).hidden).toBe(false);
  });
});
